import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Alumni from '@/models/Alumni';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const alumni = await Alumni.findByIdAndUpdate(id, await req.json(), { new: true });
  if (!alumni) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'alumni', description: `Updated alumni: ${alumni.name}` });
  return NextResponse.json(alumni);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const alumni = await Alumni.findByIdAndDelete(id);
  if (!alumni) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'alumni', description: `Deleted alumni: ${alumni.name}` });
  return NextResponse.json({ success: true });
}
