import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
import College from '@/models/College';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Fetch full user profile
    const user = await User.findById(userPayload.id).select('-password').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Validate saved colleges before population to avoid invalid ObjectId cast errors
    const savedCollegeIds = Array.isArray(user.savedColleges)
      ? user.savedColleges.filter((id: any) => mongoose.isValidObjectId(id))
      : [];

    const savedColleges = savedCollegeIds.length > 0
      ? await College.find({ _id: { $in: savedCollegeIds } }).select('name city state slug featured image').lean()
      : [];

    user.savedColleges = savedColleges;

    // Allow multiple device sessions.
    // Only reject if the student session was explicitly cleared by force logout.
    if (user.sessionToken === null) {
      return NextResponse.json({ error: 'Session expired or invalidated by Admin' }, { status: 401 });
    }

    // Fetch user's applications
    const applications = await Application.find({ userId: user._id })
      .populate('college', 'name city slug')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user's official admission records (Admitted Students)
    const { default: StudentRecord } = await import('@/models/StudentRecord');
    const studentRecords = await StudentRecord.find({ email: user.email })
      .populate('collegeId', 'name')
      .populate('courseId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch Global and Targeted Notices
    const { default: Notice } = await import('@/models/Notice');
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

    // Fetch Student Support Tickets
    const { default: Ticket } = await import('@/models/Ticket');
    const tickets = await Ticket.find({ studentId: user._id })
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json({ success: true, user, applications, studentRecords, notices, tickets });

  } catch (err: any) {
    console.error('Student Dashboard API Error:', err?.message || err, err?.stack || 'no stack');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
