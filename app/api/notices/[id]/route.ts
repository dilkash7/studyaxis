import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Notice from '@/models/Notice';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const body = await req.json();
  const notice = await Notice.findByIdAndUpdate(id, body, { new: true });
  if (!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'update', module: 'notices',
    description: `Updated notice: ${notice.title}`,
  });
  return NextResponse.json(notice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const notice = await Notice.findByIdAndDelete(id);
  if (!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'delete', module: 'notices',
    description: `Deleted notice: ${notice.title}`,
  });
  return NextResponse.json({ success: true });
}
