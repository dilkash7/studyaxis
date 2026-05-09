import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Testimonial from '@/models/Testimonial';

export async function GET() {
  await connectDB();
  return NextResponse.json(await Testimonial.find().sort({ isFeatured: -1, createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const t = await Testimonial.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'testimonials', description: `Created testimonial: ${body.name}` });
  return NextResponse.json(t, { status: 201 });
}
