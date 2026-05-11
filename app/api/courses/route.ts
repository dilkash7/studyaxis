import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { generateSlug, generateSEO } from '@/lib/courseClassifier';
import { sanitizeObjectIds } from '@/lib/objectId';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    const filter: any = {};
    if (searchParams.get('all') !== 'true') {
      filter.active = true;
    }
    if (collegeId) filter.collegeId = collegeId;
    const courses = await Course.find(filter).lean();
    return NextResponse.json(courses);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const cleanBody = sanitizeObjectIds(body, ['collegeId', 'campusId']);

    // Use the new Master Normalization System to enforce canonical names
    if (cleanBody.name) {
      const classified = require('@/lib/courseClassifier').fullClassify(cleanBody.name);
      cleanBody.rawName = cleanBody.name; // Keep history
      cleanBody.name = classified.normalizedName || cleanBody.name;
    }

    // Auto-generate slug + SEO if not provided
    if (!cleanBody.slug && cleanBody.name) cleanBody.slug = generateSlug(`${cleanBody.collegeName || ''}-${cleanBody.name}`);
    if (!cleanBody.metaTitle && cleanBody.name) {
      const seo = generateSEO(cleanBody.collegeName || '', cleanBody.name);
      cleanBody.metaTitle = seo.metaTitle;
      cleanBody.metaDescription = seo.metaDescription;
      cleanBody.metaKeywords = seo.keywords;
    }

    const course = await Course.create(cleanBody);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'courses', description: `Created course: ${body.name}`, targetId: course._id, targetName: body.name });
    
    // Automatically parse and attach Fee structure if provided
    if (body.fee) {
      try {
        const feeAmount = typeof body.fee === 'object' ? body.fee.display || String(body.fee.amount) : String(body.fee);
        const Fees = require('@/models/Fees').default || require('@/models/Fees');
        await Fees.create({
          courseId: course._id,
          courseName: course.name,
          collegeId: course.collegeId,
          collegeName: course.collegeName,
          feeCategory: 'General',
          totalFee: feeAmount,
          source: { sourceType: 'admin', verified: false }
        });
      } catch (e: any) {
        console.error('Fee creation warning:', e.message);
      }
    }

    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    console.error('Course creation error:', err.message);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
