import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { extractTextFromBuffer, extractTextFromUrl } from '@/lib/ocr';
import { normalizeOCRText } from '@/lib/ocr/normalizer';
import { fullParse } from '@/lib/ocr/parser';
import { deduplicateCourses } from '@/lib/ocr/deduplicator';
import { scoreField, scoreScan } from '@/lib/ocr/confidence';
import { isPDF, parsePDF } from '@/lib/ocr/pdfParser';
import { parseExcel, excelToCourseImport, isExcel, isCSV } from '@/lib/ocr/excelParser';
import { detectTable, mergeTableWithCourses } from '@/lib/ocr/tableDetector';

/**
 * Document Intelligence Pipeline API
 * 
 * Supports: Images (JPG/PNG/WEBP) | PDF | Excel (.xlsx/.xls) | CSV
 * 
 * Pipeline:
 *   Upload → Detect File Type → Extract (OCR/PDF/Excel)
 *   → Normalize → Table Detection → Course Extraction → Fee Extraction
 *   → Dedup → Confidence Score → Return for Admin Review
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let fileName = '';
    let fileType = '';

    // ===== STEP 1: Get the file =====
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

      const maxSize = 20 * 1024 * 1024; // 20MB for PDFs/Excel
      if (file.size > maxSize) return NextResponse.json({ error: 'File too large. Max 20MB.' }, { status: 400 });

      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name || '';
      fileType = file.type || '';
    } else {
      const body = await req.json();
      if (body.imageUrl) {
        // URL-based scan (images only)
        const ocrResult = await extractTextFromUrl(body.imageUrl);
        return processOCRText(ocrResult.text, ocrResult.confidence, 'tesseract.js (URL)', startTime, user);
      }
      return NextResponse.json({ error: 'Upload a file or provide imageUrl' }, { status: 400 });
    }

    // ===== STEP 2: Detect file type + route to proper engine =====
    const ext = fileName.toLowerCase().split('.').pop() || '';

    // Excel/CSV → Direct structured read (HIGHEST ACCURACY)
    if (isExcel(fileBuffer) || ext === 'xlsx' || ext === 'xls' || ext === 'csv' || isCSV(fileBuffer)) {
      return processExcel(fileBuffer, fileName, startTime, user);
    }

    // PDF → Text extraction + fallback to OCR
    if (isPDF(fileBuffer) || ext === 'pdf' || fileType === 'application/pdf') {
      return processPDF(fileBuffer, startTime, user);
    }

    // Image → OCR
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
    const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'tif'];
    if (imageTypes.includes(fileType) || imageExts.includes(ext)) {
      const ocrResult = await extractTextFromBuffer(fileBuffer);
      return processOCRText(ocrResult.text, ocrResult.confidence, 'tesseract.js', startTime, user);
    }

    return NextResponse.json({
      error: `Unsupported file: ${fileName || fileType}`,
      supported: 'Images (JPG/PNG/WEBP), PDF, Excel (.xlsx/.xls), CSV',
    }, { status: 400 });

  } catch (err: any) {
    console.error('Document Intelligence error:', err);
    return NextResponse.json({
      error: err.message || 'Processing failed',
      hint: 'Try a different file format. Excel gives best results for structured data.',
    }, { status: 500 });
  }
}

// ===== EXCEL PROCESSOR =====
async function processExcel(buffer: Buffer, fileName: string, startTime: number, user: any) {
  const result = parseExcel(buffer);
  const courses = excelToCourseImport(result);
  const deduped = deduplicateCourses(courses);

  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'create', module: 'ocr',
    description: `Excel import: ${fileName} — ${result.totalRows} rows, ${deduped.unique.length} unique courses`,
  });

  return NextResponse.json({
    success: true,
    engine: 'excel-parser',
    fileType: 'excel',

    // Column mapping
    columnMapping: result.mappedColumns,
    headers: result.headers,
    sheetName: result.sheetName,

    // Structured data
    courses: deduped.unique.map(c => ({
      normalizedName: c.name,
      rawName: c.name,
      fee: c.feeAmount ? { amount: c.feeAmount, display: c.fee } : null,
      stream: c.stream,
      degreeType: c.degreeType || c.courseType,
      specialization: c.specialization,
      duration: c.duration,
      eligibility: c.eligibility,
      collegeName: c.collegeName,
      confidence: c.confidence || 95,
      needsReview: false,
      source: 'excel',
    })),

    // Stats
    deduplication: {
      uniqueCourses: deduped.unique.length,
      duplicatesRemoved: deduped.duplicatesRemoved,
      mergeLog: deduped.mergeLog,
    },
    confidence: {
      overall: 95,
      summary: `Excel import: ${deduped.unique.length} courses extracted with high accuracy`,
      reviewRequired: false,
    },
    totalRows: result.totalRows,
    processingTimeMs: Date.now() - startTime,
  });
}

// ===== PDF PROCESSOR =====
async function processPDF(buffer: Buffer, startTime: number, user: any) {
  const pdfResult = await parsePDF(buffer);

  if (!pdfResult.text || pdfResult.text.length < 20) {
    return NextResponse.json({
      success: true,
      engine: 'pdf-parser',
      fileType: 'pdf',
      message: 'PDF appears to be scanned/image-based. Please upload individual page screenshots for OCR.',
      pages: pdfResult.pages,
      isScanned: pdfResult.isScanned,
      processingTimeMs: Date.now() - startTime,
    });
  }

  // Process extracted text through the full pipeline
  return processOCRText(pdfResult.text, pdfResult.isScanned ? 60 : 85, `pdf-${pdfResult.method}`, startTime, user, pdfResult.pages);
}

// ===== OCR TEXT PROCESSOR (shared by Image + PDF) =====
async function processOCRText(rawText: string, ocrConfidence: number, engine: string, startTime: number, user: any, pdfPages?: number) {
  if (!rawText || rawText.trim().length === 0) {
    return NextResponse.json({
      success: true,
      pipeline: { step: 'ocr', status: 'no_text' },
      message: 'No text detected. Try a clearer image with better lighting.',
      ocrConfidence,
      processingTimeMs: Date.now() - startTime,
    });
  }

  // Normalize
  const normalizedText = normalizeOCRText(rawText);

  // Parse structured data
  const parsed = fullParse(rawText);

  // Table detection — improves fee extraction from tabular layouts
  const tableResult = detectTable(normalizedText);
  let finalCourses = parsed.courses;

  if (tableResult.isTable && tableResult.rows.length > 0) {
    // Merge table-detected rows with regular parsing for best results
    const merged = mergeTableWithCourses(tableResult.rows, parsed.courses);
    finalCourses = merged;
  }

  // Deduplicate
  const deduped = deduplicateCourses(finalCourses);

  // Confidence scoring
  const fieldScores = [];
  if (parsed.college) {
    fieldScores.push(scoreField('college', parsed.college.name, parsed.college.confidence, !!parsed.college.name));
  }
  for (const course of deduped.unique) {
    const conf = course.confidence || 50;
    fieldScores.push(scoreField('course', course.normalizedName || course.normalizedCourse || '', conf, conf > 60));
  }
  for (const fee of parsed.fees) {
    fieldScores.push(scoreField('fee', fee.normalized.display, undefined, fee.normalized.amount > 0));
  }
  const scanScore = scoreScan(fieldScores);

  // Log
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'create', module: 'ocr',
    description: `AI Scan [${engine}]: ${deduped.unique.length} courses, ${parsed.fees.length} fees, table=${tableResult.isTable} | ${scanScore.overall}%`,
  });

  return NextResponse.json({
    success: true,
    engine,
    fileType: pdfPages ? 'pdf' : 'image',
    ...(pdfPages ? { pdfPages } : {}),

    // Structured results
    college: parsed.college,
    courses: deduped.unique.map(c => ({
      rawName: c.rawName || c.course || '',
      normalizedName: c.normalizedName || c.normalizedCourse || '',
      fee: c.fee || null,
      stream: c.classification?.mainCategory || c.stream || '',
      degreeType: c.classification?.courseType || c.degreeType || '',
      specialization: c.classification?.specialization || c.specialization || '',
      duration: c.classification?.duration || c.duration || '',
      eligibility: c.classification?.eligibility || '',
      confidence: c.confidence || 50,
      needsReview: (c.confidence || 50) < 70,
      source: c.source || 'ocr',
    })),
    fees: parsed.fees.map(f => ({
      label: f.label,
      rawAmount: f.rawAmount,
      amount: f.normalized.amount,
      display: f.normalized.display,
      category: f.category,
    })),
    contactInfo: parsed.contactInfo,

    // Table detection
    tableDetected: tableResult.isTable,
    tableRows: tableResult.isTable ? tableResult.rows.length : 0,
    tableConfidence: tableResult.tableConfidence,

    // Dedup
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

    warnings: parsed.warnings,
    normalizedText: parsed.normalizedText,
    ocrConfidence,
    processingTimeMs: Date.now() - startTime,
  });
}
