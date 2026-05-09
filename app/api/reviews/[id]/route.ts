import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const review = await Review.findByIdAndUpdate(id, await req.json(), { new: true });
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'reviews', description: `Updated review by ${review.userName}` });
  return NextResponse.json(review);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const review = await Review.findByIdAndDelete(id);
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'reviews', description: `Deleted review by ${review.userName}` });
  return NextResponse.json({ success: true });
}
