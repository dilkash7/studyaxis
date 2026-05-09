import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Scholarship from '@/models/Scholarship';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const s = await Scholarship.findByIdAndUpdate(id, await req.json(), { new: true });
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'scholarships', description: `Updated scholarship: ${s.name}` });
  return NextResponse.json(s);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const s = await Scholarship.findByIdAndDelete(id);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'scholarships', description: `Deleted scholarship: ${s.name}` });
  return NextResponse.json({ success: true });
}
