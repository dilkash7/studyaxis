import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { extractTextFromImage, parseOCRText } from '@/lib/ocr';
import { fullClassify } from '@/lib/courseClassifier';

/**
 * OCR Scan API
 * POST body: { imageUrl } or multipart form with file
 * Returns: extracted text, detected courses, fees, contact info
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let rawText = '';

    if (contentType.includes('application/json')) {
      const { imageUrl } = await req.json();
      if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
      rawText = await extractTextFromImage(imageUrl);
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const { extractTextFromBuffer } = await import('@/lib/ocr');
      rawText = await extractTextFromBuffer(buffer);
    } else {
      return NextResponse.json({ error: 'Send JSON with imageUrl or multipart form with file' }, { status: 400 });
    }

    // Parse the extracted text
    const parsed = parseOCRText(rawText);

    // Auto-classify each detected course
    const classifiedCourses = parsed.courses.map(name => ({
      name,
      ...fullClassify(name),
    }));

    await logAdminAction({
      adminId: user.id, adminName: user.name,
      action: 'create', module: 'ocr',
      description: `OCR scan: ${parsed.courses.length} courses, ${parsed.fees.length} fees detected`,
      metadata: { courses: parsed.courses.length, fees: parsed.fees.length, confidence: parsed.confidence },
    });

    return NextResponse.json({
      success: true,
      rawText: parsed.fullText,
      courses: classifiedCourses,
      fees: parsed.fees,
      contactInfo: parsed.contactInfo,
      confidence: parsed.confidence,
    });
  } catch (err: any) {
    console.error('OCR API error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
