import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import SeatAvailability from '@/models/SeatAvailability';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  return NextResponse.json(await SeatAvailability.find(filter).sort({ course: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  body.availableSeats = (body.totalSeats || 0) - (body.filledSeats || 0);
  body.status = body.availableSeats <= 0 ? 'Full' : body.availableSeats <= 5 ? 'Limited' : 'Available';
  const seat = await SeatAvailability.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'seats', description: `Added seats: ${body.course} (${body.availableSeats} available)` });
  return NextResponse.json(seat, { status: 201 });
}
