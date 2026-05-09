import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Inquiry from '@/models/Inquiry';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const inq = await Inquiry.findByIdAndUpdate(id, await req.json(), { new: true });
  if (!inq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'inquiries', description: `Updated inquiry from ${inq.name}: ${inq.status}` });
  return NextResponse.json(inq);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const inq = await Inquiry.findByIdAndDelete(id);
  if (!inq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'inquiries', description: `Deleted inquiry from ${inq.name}` });
  return NextResponse.json({ success: true });
}
