import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import { sanitizeObjectIds } from '@/lib/objectId';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const course = await Course.findById(id).lean();
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const cleanBody = sanitizeObjectIds(body, ['collegeId', 'campusId']);
    const course = await Course.findByIdAndUpdate(id, cleanBody, { returnDocument: 'after' });
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'courses', description: `Updated course: ${course?.name}`, targetId: id });
    return NextResponse.json({ success: true, course });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    await Course.findByIdAndDelete(id);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'courses', description: `Deleted course ID: ${id}`, targetId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}