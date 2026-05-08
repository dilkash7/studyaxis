import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminLog from '@/models/AdminLog';

// GET: Fetch admin activity logs with pagination and filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminId = searchParams.get('adminId');
    const module = searchParams.get('module');
    const action = searchParams.get('action');

    const query: any = {};
    if (adminId) query.adminId = adminId;
    if (module) query.module = module;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AdminLog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('AdminLog GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
