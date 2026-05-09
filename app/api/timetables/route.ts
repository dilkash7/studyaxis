import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Timetable from '@/models/Timetable';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  return NextResponse.json(await Timetable.find(filter).sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const tt = await Timetable.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'timetable', description: `Created timetable: ${body.title}` });
  return NextResponse.json(tt, { status: 201 });
}
