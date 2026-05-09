import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';

// Public GET: fetch single blog by ObjectId or slug
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    let blog;
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: id });
    }
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    return NextResponse.json(blog);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const body = await req.json();
  if (body.isPublished && !body.publishedAt) body.publishedAt = new Date();
  const blog = await Blog.findByIdAndUpdate(id, body, { new: true });
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'update', module: 'blog',
    description: `Updated blog: ${blog.title}`,
  });
  return NextResponse.json(blog);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'delete', module: 'blog',
    description: `Deleted blog: ${blog.title}`,
  });
  return NextResponse.json({ success: true });
}
