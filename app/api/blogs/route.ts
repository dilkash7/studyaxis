import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Blog from '@/models/Blog';

export async function GET() {
  await connectDB();
  const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  if (!body.slug) {
    body.slug = body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;
  }
  if (body.isPublished && !body.publishedAt) body.publishedAt = new Date();
  const blog = await Blog.create({ ...body, author: user.name });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'create', module: 'blog',
    description: `Created blog: ${body.title}`,
  });
  return NextResponse.json(blog, { status: 201 });
}
