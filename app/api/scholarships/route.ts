import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Scholarship from '@/models/Scholarship';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const type = new URL(req.url).searchParams.get('type');
  const filter: any = {};
  if (collegeId) filter.college = collegeId;
  if (type) filter.type = type;
  return NextResponse.json(await Scholarship.find(filter).sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const s = await Scholarship.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'scholarships', description: `Created scholarship: ${body.name}` });
  return NextResponse.json(s, { status: 201 });
}
