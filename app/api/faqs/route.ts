import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import FAQ from '@/models/FAQ';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const category = new URL(req.url).searchParams.get('category');
  const filter: any = {};
  if (collegeId) filter.college = collegeId;
  if (category) filter.category = category;
  return NextResponse.json(await FAQ.find(filter).sort({ order: 1, createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const faq = await FAQ.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'faq', description: `Created FAQ: ${body.question?.slice(0, 50)}` });
  return NextResponse.json(faq, { status: 201 });
}
