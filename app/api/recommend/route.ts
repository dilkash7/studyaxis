import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';
import { getRecommendations } from '@/lib/recommendation';

export async function POST(req: NextRequest) {
  await connectDB();
  const preferences = await req.json();

  const [colleges, courses, fees] = await Promise.all([
    College.find({ isActive: { $ne: false } }).lean(),
    Course.find().lean(),
    Fees.find().lean(),
  ]);

  const results = getRecommendations(colleges, courses, fees, preferences, 10);

  return NextResponse.json({
    count: results.length,
    recommendations: results.map(r => ({
      _id: r.college._id,
      name: r.college.name,
      location: r.college.location || r.college.city,
      type: r.college.type,
      image: r.college.image,
      rating: r.college.rating,
      score: r.score,
      reasons: r.reasons,
    })),
  });
}
