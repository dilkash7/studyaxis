import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Hostel from '@/models/Hostel';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const hostel = await Hostel.findByIdAndUpdate(id, await req.json(), { new: true });
  if (!hostel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'hostels', description: `Updated hostel: ${hostel.name}` });
  return NextResponse.json(hostel);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const hostel = await Hostel.findByIdAndDelete(id);
  if (!hostel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'hostels', description: `Deleted hostel: ${hostel.name}` });
  return NextResponse.json({ success: true });
}
