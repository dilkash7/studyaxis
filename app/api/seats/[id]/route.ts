import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import SeatAvailability from '@/models/SeatAvailability';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const body = await req.json();
  if (body.totalSeats != null || body.filledSeats != null) {
    const total = body.totalSeats ?? 0;
    const filled = body.filledSeats ?? 0;
    body.availableSeats = total - filled;
    body.status = body.availableSeats <= 0 ? 'Full' : body.availableSeats <= 5 ? 'Limited' : 'Available';
    body.lastUpdated = new Date();
  }
  const s = await SeatAvailability.findByIdAndUpdate(id, body, { new: true });
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'seats', description: `Updated seats: ${s.course}` });
  return NextResponse.json(s);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const s = await SeatAvailability.findByIdAndDelete(id);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'seats', description: `Deleted seats: ${s.course}` });
  return NextResponse.json({ success: true });
}
