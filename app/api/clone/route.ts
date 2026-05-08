import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { generateSlug } from '@/lib/courseClassifier';

/**
 * Clone a college with all its courses and fees.
 * POST body: { collegeId, newName }
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const { collegeId, newName } = await req.json();
    if (!collegeId || !newName) return NextResponse.json({ error: 'collegeId and newName required' }, { status: 400 });

    // 1. Clone college
    const original = await College.findById(collegeId).lean() as any;
    if (!original) return NextResponse.json({ error: 'College not found' }, { status: 404 });

    const { _id, createdAt, updatedAt, __v, ...collegeData } = original;
    const cloned = await College.create({
      ...collegeData,
      name: newName,
      slug: generateSlug(newName),
      campuses: [],
      categories: [],
      media: [],
    });

    // 2. Clone courses
    const courses = await Course.find({ collegeId }).lean();
    const courseMap: Record<string, string> = {};
    let clonedCourses = 0;

    for (const course of courses) {
      const { _id: cId, createdAt: ca, updatedAt: ua, __v: v, ...courseData } = course as any;
      const newCourse = await Course.create({
        ...courseData,
        collegeId: cloned._id,
        collegeName: newName,
        slug: generateSlug(`${newName}-${courseData.name}`),
      });
      courseMap[cId.toString()] = newCourse._id.toString();
      clonedCourses++;
    }

    // 3. Clone fees
    const fees = await Fees.find({ collegeId }).lean();
    let clonedFees = 0;

    for (const fee of fees) {
      const { _id: fId, createdAt: ca, updatedAt: ua, __v: v, ...feeData } = fee as any;
      const newCourseId = feeData.courseId ? courseMap[feeData.courseId.toString()] : undefined;
      await Fees.create({
        ...feeData,
        collegeId: cloned._id,
        collegeName: newName,
        courseId: newCourseId || feeData.courseId,
      });
      clonedFees++;
    }

    await logAdminAction({
      adminId: user.id, adminName: user.name,
      action: 'create', module: 'colleges',
      description: `Cloned college "${original.name}" as "${newName}" (${clonedCourses} courses, ${clonedFees} fees)`,
      targetId: cloned._id, targetName: newName,
    });

    return NextResponse.json({
      success: true,
      clonedCollege: cloned._id,
      clonedCourses,
      clonedFees,
    });
  } catch (err: any) {
    console.error('Clone error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
