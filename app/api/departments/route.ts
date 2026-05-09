import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Department from '@/models/Department';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  const departments = await Department.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const dept = await Department.create(body);
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'create', module: 'departments',
    description: `Created department: ${body.name}`,
  });
  return NextResponse.json(dept, { status: 201 });
}
