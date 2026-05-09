import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Review from '@/models/Review';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const approved = new URL(req.url).searchParams.get('approved');
  const filter: any = {};
  if (collegeId) filter.college = collegeId;
  if (approved === 'true') filter.isApproved = true;
  return NextResponse.json(await Review.find(filter).sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.userName || !body.content || !body.overallRating || !body.college) {
    return NextResponse.json({ error: 'Name, content, rating, and college are required' }, { status: 400 });
  }
  // Public endpoint — no auth needed for submitting reviews
  const review = await Review.create(body);
  return NextResponse.json({ success: true, message: 'Review submitted for approval', id: review._id }, { status: 201 });
}
