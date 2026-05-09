import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Notice from '@/models/Notice';

export async function GET() {
  await connectDB();
  const notices = await Notice.find().sort({ pinned: -1, publishDate: -1 }).lean();
  return NextResponse.json(notices);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const notice = await Notice.create({ ...body, createdBy: user.name });
  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'create', module: 'notices',
    description: `Created notice: ${body.title}`,
  });
  return NextResponse.json(notice, { status: 201 });
}
