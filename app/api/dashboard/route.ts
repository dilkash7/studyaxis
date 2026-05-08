import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';
import Campus from '@/models/Campus';
import AdminLog from '@/models/AdminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const [
      totalColleges,
      totalCourses,
      totalFees,
      totalCampuses,
      recentLogs,
      coursesByCategory,
    ] = await Promise.all([
      College.countDocuments({ active: true }),
      Course.countDocuments({ active: true }),
      Fees.countDocuments({ active: true }),
      Campus.countDocuments({ active: true }),
      AdminLog.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      Course.aggregate([
        { $match: { active: true, mainCategory: { $ne: null } } },
        { $group: { _id: '$mainCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalColleges,
        totalCourses,
        totalFees,
        totalCampuses,
      },
      coursesByCategory: coursesByCategory.map((c: any) => ({
        name: c._id,
        count: c.count,
      })),
      recentActivity: recentLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
