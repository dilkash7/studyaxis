import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Gallery from '@/models/Gallery';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: any = {};
  if (searchParams.get('collegeId')) filter.college = searchParams.get('collegeId');
  if (searchParams.get('category')) filter.category = searchParams.get('category');
  return NextResponse.json(await Gallery.find(filter).sort({ isFeatured: -1, order: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const g = await Gallery.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'gallery', description: `Added gallery: ${body.title}` });
  return NextResponse.json(g, { status: 201 });
}
