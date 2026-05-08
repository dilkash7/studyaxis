import { connectDB } from '@/lib/mongodb';
import StudentRecord from '@/models/StudentRecord';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

function checkStudentRecordAccess(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (
    payload.role === 'superadmin' ||
    payload.detailedPermissions?.studentRecords === true
  ) {
    return payload;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = checkStudentRecordAccess(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const student = await StudentRecord.findById(id)
      .populate('collegeId', 'name')
      .populate('campusId', 'name')
      .populate('courseId', 'name')
      .populate('admissionCategory', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = checkStudentRecordAccess(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const data = await req.json();

    const student = await StudentRecord.findByIdAndUpdate(
      id,
      { ...data, updatedBy: payload.id },
      { new: true }
    )
      .populate('collegeId', 'name')
      .populate('campusId', 'name')
      .populate('courseId', 'name')
      .populate('admissionCategory', 'name');

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    await logAdminAction({ adminId: payload.id, adminName: payload.name, action: 'update', module: 'student-records', description: `Updated student: ${student.firstName} ${student.lastName}`, targetId: id });
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = checkStudentRecordAccess(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const student = await StudentRecord.findByIdAndDelete(id);

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    await logAdminAction({ adminId: payload.id, adminName: payload.name, action: 'delete', module: 'student-records', description: `Deleted student: ${student.firstName} ${student.lastName}`, targetId: id });
    return NextResponse.json({ success: true, message: 'Student record deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
