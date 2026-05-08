import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { fullClassify, generateSlug, generateSEO } from '@/lib/courseClassifier';

/**
 * Bulk Import API — accepts JSON array of courses
 * Each item needs: name, collegeId, collegeName
 * System auto-fills: mainCategory, courseType, degreeType, specialization, duration, eligibility, slug, SEO
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const { courses, collegeId, collegeName } = await req.json();
    if (!courses || !Array.isArray(courses) || !collegeId) {
      return NextResponse.json({ error: 'courses array and collegeId required' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const item of courses) {
      try {
        const name = typeof item === 'string' ? item : item.name;
        if (!name) { errors.push({ name: 'unnamed', error: 'Missing name' }); continue; }

        // Auto-classify
        const classified = fullClassify(name);
        const slug = generateSlug(`${collegeName}-${name}`);
        const seo = generateSEO(collegeName, name);

        const courseData: any = {
          name,
          collegeId,
          collegeName,
          slug,
          mainCategory: classified.mainCategory,
          courseType: classified.courseType,
          degreeType: classified.degreeType,
          specialization: classified.specialization,
          entranceExam: classified.entranceExam,
          duration: classified.duration,
          eligibility: classified.eligibility,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.keywords,
          active: true,
        };

        // Merge any extra fields from item
        if (typeof item === 'object') {
          if (item.duration) courseData.duration = item.duration;
          if (item.seats) courseData.seats = item.seats;
          if (item.eligibility) courseData.eligibility = item.eligibility;
          if (item.campusId) courseData.campusId = item.campusId;
          if (item.campusName) courseData.campusName = item.campusName;
        }

        const course = await Course.create(courseData);
        results.push({ name, _id: course._id, confidence: classified.confidence });
      } catch (err: any) {
        errors.push({ name: typeof item === 'string' ? item : item?.name, error: err.message });
      }
    }

    await logAdminAction({
      adminId: user.id, adminName: user.name,
      action: 'create', module: 'courses',
      description: `Bulk imported ${results.length} courses for ${collegeName}`,
      metadata: { imported: results.length, errors: errors.length },
    });

    return NextResponse.json({
      success: true,
      imported: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    });
  } catch (err: any) {
    console.error('Bulk import error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
