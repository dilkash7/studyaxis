import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const city = searchParams.get('city') || '';
    const minFee = searchParams.get('minFee') || '';
    const maxFee = searchParams.get('maxFee') || '';

    if (!q && !type && !city) {
      return NextResponse.json({ colleges: [], courses: [] });
    }

    const collegeFilter: any = {};
    if (q) collegeFilter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
      { country: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
    if (type) collegeFilter.type = type;
    if (city) collegeFilter.city = { $regex: city, $options: 'i' };

    const courseFilter: any = {};
    if (q) courseFilter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { collegeName: { $regex: q, $options: 'i' } },
    ];

    const [colleges, courses] = await Promise.all([
      College.find(collegeFilter).limit(20).lean(),
      Course.find(courseFilter).limit(10).lean(),
    ]);

    return NextResponse.json({ colleges, courses });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}