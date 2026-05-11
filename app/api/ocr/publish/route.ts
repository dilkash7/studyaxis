import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Course from '@/models/Course';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const { courses, collegeId, collegeName } = await req.json();

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: 'No courses provided to publish' }, { status: 400 });
    }

    let publishedCount = 0;
    const errors = [];

    for (const c of courses) {
      try {
        if (!c.normalizedName) continue;
        
        await Course.create({
          name: c.normalizedName,
          college: collegeId || null,
          collegeName: collegeName || null,
          fee: c.fee?.display || null,
          feeAmount: c.fee?.amount || null,
          stream: c.stream || 'Other',
          degreeType: c.degreeType || 'UG',
          specialization: c.specialization || '',
          duration: c.duration || '',
          eligibility: c.eligibility || '',
          status: 'Published', // Status from approval workflow
          createdBy: user.name,
          source: c.source || 'ocr',
        });
        publishedCount++;
      } catch (err: any) {
        errors.push(`Failed to publish ${c.normalizedName}: ${err.message}`);
      }
    }

    await logAdminAction({
      adminId: user.id, adminName: user.name,
      action: 'create', module: 'ocr_publish',
      description: `Published ${publishedCount} OCR extracted courses`,
    });

    return NextResponse.json({ 
      success: true, 
      published: publishedCount, 
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (err: any) {
    console.error('Publish error:', err);
    return NextResponse.json({ error: 'Failed to publish records' }, { status: 500 });
  }
}
