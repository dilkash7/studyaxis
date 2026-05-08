import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { fullClassify } from '@/lib/courseClassifier';

/**
 * OCR Scan API
 * POST body: { imageUrl } or multipart form with file
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let rawText = '';

    // Dynamic import to avoid build-time issues
    const { extractTextFromImage, extractTextFromBuffer, parseOCRText } = await import('@/lib/ocr');

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromBuffer(buffer);
    } else {
      const body = await req.json();
      const { imageUrl } = body;
      if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
      rawText = await extractTextFromImage(imageUrl);
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({
        success: true,
        rawText: '',
        courses: [],
        fees: [],
        contactInfo: { phones: [], emails: [], websites: [] },
        confidence: 0,
        message: 'No text detected in the image. Try a clearer image or a different angle.',
      });
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
    console.error('OCR API error:', err);
    const message = err.message || 'OCR scan failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
