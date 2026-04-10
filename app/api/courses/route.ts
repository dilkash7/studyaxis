import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    const filter: any = { active: true };
    if (collegeId) filter.collegeId = collegeId;
    const courses = await Course.find(filter).lean();
    return NextResponse.json(courses);
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
    const course = await Course.create(body);
    return NextResponse.json({ success: true, course });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}