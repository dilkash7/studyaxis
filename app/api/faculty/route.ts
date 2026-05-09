import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Faculty from '@/models/Faculty';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const department = new URL(req.url).searchParams.get('department');
  const filter: any = {};
  if (collegeId) filter.college = collegeId;
  if (department) filter.department = department;
  return NextResponse.json(await Faculty.find(filter).sort({ isHOD: -1, name: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const faculty = await Faculty.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'faculty', description: `Added faculty: ${body.name}` });
  return NextResponse.json(faculty, { status: 201 });
}
