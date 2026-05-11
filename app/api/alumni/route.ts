import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Alumni from '@/models/Alumni';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  return NextResponse.json(await Alumni.find(filter).sort({ isFeatured: -1, graduationYear: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const alumni = await Alumni.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'alumni', description: `Added alumni: ${body.name}` });
  return NextResponse.json(alumni, { status: 201 });
}
