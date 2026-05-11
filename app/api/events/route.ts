import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  const events = await Event.find(filter).sort({ date: -1 }).lean();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const event = await Event.create({ ...body, createdBy: user.name });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'events', description: `Created event: ${body.title}` });
  return NextResponse.json(event, { status: 201 });
}
