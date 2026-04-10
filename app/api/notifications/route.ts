import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    // Get latest 10 leads as notifications
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const notifications = leads.map((l: any) => ({
      id: l._id,
      type: 'new_lead',
      title: 'New Inquiry',
      message: `${l.name} enquired about ${l.course || 'a course'}`,
      time: l.createdAt,
      read: false,
      phone: l.phone,
      source: l.source || 'Website',
    }));

    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}