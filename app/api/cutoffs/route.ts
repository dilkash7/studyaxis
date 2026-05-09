import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Cutoff from '@/models/Cutoff';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: any = {};
  if (searchParams.get('collegeId')) filter.college = searchParams.get('collegeId');
  if (searchParams.get('exam')) filter.exam = searchParams.get('exam');
  if (searchParams.get('year')) filter.year = Number(searchParams.get('year'));
  return NextResponse.json(await Cutoff.find(filter).sort({ year: -1, exam: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const cutoff = await Cutoff.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'cutoffs', description: `Added cutoff: ${body.exam} ${body.year} - ${body.course}` });
  return NextResponse.json(cutoff, { status: 201 });
}
