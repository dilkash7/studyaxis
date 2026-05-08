import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { extractTextFromBuffer, extractTextFromUrl } from '@/lib/ocr';
import { normalizeOCRText } from '@/lib/ocr/normalizer';
import { fullParse } from '@/lib/ocr/parser';
import { deduplicateCourses } from '@/lib/ocr/deduplicator';
import { scoreField, scoreScan } from '@/lib/ocr/confidence';

/**
 * OCR Scan API — Full Pipeline
 * 
 * Upload → Tesseract OCR → Normalize → Parse → Dedup → Score → Return
 * 
 * NEVER saves raw OCR to DB. Returns structured data for admin review.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let ocrResult;

    // ===== STEP 1: Extract raw text via Tesseract =====
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
      
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}. Use JPG, PNG, or WEBP.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      ocrResult = await extractTextFromBuffer(buffer);
    } else {
      const body = await req.json();
      const { imageUrl } = body;
      if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
      ocrResult = await extractTextFromUrl(imageUrl);
    }

    if (!ocrResult.text || ocrResult.text.trim().length === 0) {
      return NextResponse.json({
        success: true,
        pipeline: { step: 'ocr', status: 'no_text' },
        message: 'No text detected. Try a clearer image with better lighting.',
        ocrConfidence: ocrResult.confidence,
        processingTimeMs: Date.now() - startTime,
      });
    }

    // ===== STEP 2: Normalize text (THE CORE) =====
    const normalizedText = normalizeOCRText(ocrResult.text);

    // ===== STEP 3: Parse structured data =====
    const parsed = fullParse(ocrResult.text); // parser does its own normalization

    // ===== STEP 4: Deduplicate courses =====
    const courseNames = parsed.courses.map(c => c.normalizedName);
    const deduped = deduplicateCourses(courseNames);

    // ===== STEP 5: Confidence scoring =====
    const fieldScores = [];
    
    if (parsed.college) {
      fieldScores.push(scoreField('college', parsed.college.name, parsed.college.confidence, !!parsed.college.name));
    }
    
    for (const course of parsed.courses) {
      fieldScores.push(scoreField('course', course.normalizedName, course.confidence, !!course.classification.mainCategory));
    }
    
    for (const fee of parsed.fees) {
      fieldScores.push(scoreField('fee', fee.normalized.display, undefined, fee.normalized.amount > 0));
    }

    const scanScore = scoreScan(fieldScores);

    // ===== STEP 6: Log scan =====
    await logAdminAction({
      adminId: user.id, adminName: user.name,
      action: 'create', module: 'ocr',
      description: `OCR scan: ${parsed.courses.length} courses (${deduped.duplicatesRemoved} dupes removed), ${parsed.fees.length} fees | Confidence: ${scanScore.overall}%`,
    });

    // ===== RETURN STRUCTURED DATA (never raw OCR) =====
    return NextResponse.json({
      success: true,
      
      // Structured results
      college: parsed.college,
      courses: parsed.courses.map(c => ({
        rawName: c.rawName,
        normalizedName: c.normalizedName,
        fee: c.fee,
        stream: c.classification.mainCategory,
        degreeType: c.classification.courseType,
        specialization: c.classification.specialization,
        duration: c.classification.duration,
        eligibility: c.classification.eligibility,
        confidence: c.confidence,
        needsReview: c.confidence < 70,
      })),
      fees: parsed.fees.map(f => ({
        label: f.label,
        rawAmount: f.rawAmount,
        amount: f.normalized.amount,
        display: f.normalized.display,
        category: f.category,
      })),
      contactInfo: parsed.contactInfo,
      
      // Dedup report
      deduplication: {
        uniqueCourses: deduped.unique.length,
        duplicatesRemoved: deduped.duplicatesRemoved,
        mergeLog: deduped.mergeLog,
      },
      
      // Confidence
      confidence: {
        overall: scanScore.overall,
        summary: scanScore.summary,
        reviewRequired: scanScore.reviewRequired,
        fields: scanScore.fields,
      },
      
      // Warnings
      warnings: parsed.warnings,
      
      // Debug (normalized text for admin review)
      normalizedText: parsed.normalizedText,
      
      // Metrics
      ocrEngine: 'tesseract.js',
      ocrConfidence: ocrResult.confidence,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('OCR scan error:', err);
    return NextResponse.json({ 
      error: err.message || 'OCR scan failed',
      hint: 'Try uploading a clearer image (JPG/PNG). Avoid blurry or low-resolution photos.'
    }, { status: 500 });
  }
}
