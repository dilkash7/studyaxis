import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Application from '@/models/Application';
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
    const user = await User.findById(userPayload.id).select('-password').populate('savedColleges', 'name city state slug featured image').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Strict Session Validation: If sessionToken is null or mismatch, force logout
    if (!user.sessionToken || user.sessionToken !== userPayload.sessionToken) {
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
    console.error('Student Dashboard API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
