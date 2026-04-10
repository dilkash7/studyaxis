import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Fees from '@/models/Fees';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const collegeId = searchParams.get('collegeId');
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (collegeId) filter.collegeId = collegeId;
    const fees = await Fees.find(filter).lean();
    return NextResponse.json(fees);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const fees = await Fees.create(body);
    return NextResponse.json({ success: true, fees });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}