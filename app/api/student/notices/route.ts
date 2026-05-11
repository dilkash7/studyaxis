import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Notice from '@/models/Notice';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userPayload.id).select('email').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Find notices that are active AND (either global OR targeted to this student's email)
    const notices = await Notice.find({
      isActive: true,
      $or: [
        { targetEmails: { $exists: false } },
        { targetEmails: { $size: 0 } },
        { targetEmails: user.email }
      ]
    })
      .sort({ pinned: -1, publishDate: -1 })
      .lean();

    return NextResponse.json({ success: true, notices });
  } catch (err: any) {
    console.error('Student Notices API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
