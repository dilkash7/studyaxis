import { connectDB } from '@/lib/mongodb';
import StudentRecord from '@/models/StudentRecord';
import Campus from '@/models/Campus';
import College from '@/models/College';
import Course from '@/models/Course';
import AdmissionCategory from '@/models/AdmissionCategory';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

/** Returns the verified token payload if the caller is allowed to manage student records */
function checkStudentRecordAccess(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Allow superadmin or any admin with explicit studentRecords permission
  if (
    payload.role === 'superadmin' ||
    payload.detailedPermissions?.studentRecords === true
  ) {
    return payload;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const payload = checkStudentRecordAccess(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const collegeId = req.nextUrl.searchParams.get('collegeId');
    const campusId = req.nextUrl.searchParams.get('campusId');
    const courseId = req.nextUrl.searchParams.get('courseId');
    const status = req.nextUrl.searchParams.get('status');
    const search = req.nextUrl.searchParams.get('search');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    if (campusId) filter.campusId = campusId;
    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const students = await StudentRecord.find(filter)
      .populate({ path: 'collegeId', model: College, select: 'name' })
      .populate({ path: 'campusId', model: Campus, select: 'name' })
      .populate({ path: 'courseId', model: Course, select: 'name' })
      .populate({ path: 'admissionCategory', model: AdmissionCategory, select: 'name' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudentRecord.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = checkStudentRecordAccess(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const data = await req.json();

    if (!data.collegeId || !data.courseId || !data.firstName || !data.email || !data.phoneNumber || !data.admissionYear) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: collegeId, courseId, firstName, email, phoneNumber, admissionYear' },
        { status: 400 }
      );
    }

    // Strip empty optional ObjectId fields
    if (!data.campusId) { delete data.campusId; delete data.campusName; }

    // Generate admission number if not provided
    if (!data.admissionNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      data.admissionNumber = `ADM${data.admissionYear}${random}`;
    }

    const student = new StudentRecord({
      ...data,
      documents: data.documents || [],
      createdBy: payload.id,
    });

    await student.save();

    await student.populate([
      { path: 'collegeId', model: College, select: 'name' },
      { path: 'campusId', model: Campus, select: 'name' },
      { path: 'courseId', model: Course, select: 'name' },
      { path: 'admissionCategory', model: AdmissionCategory, select: 'name' },
    ]);

    await logAdminAction({ adminId: payload.id, adminName: payload.name, action: 'create', module: 'student-records', description: `Registered student: ${data.firstName} ${data.lastName}`, targetId: student._id, targetName: `${data.firstName} ${data.lastName}` });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
