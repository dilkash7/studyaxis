import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const mongoose = (await import('mongoose')).default;
  const db = mongoose.connection.db;
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 500 });

  // Parallel count all collections
  const [
    colleges, courses, leads, applications, notices, blogs, faqs,
    reviews, scholarships, events, placements, alumni, faculty,
    inquiries, testimonials, admins,
  ] = await Promise.all([
    db.collection('colleges').countDocuments(),
    db.collection('courses').countDocuments(),
    db.collection('leads').countDocuments(),
    db.collection('applications').countDocuments().catch(() => 0),
    db.collection('notices').countDocuments().catch(() => 0),
    db.collection('blogs').countDocuments().catch(() => 0),
    db.collection('faqs').countDocuments().catch(() => 0),
    db.collection('reviews').countDocuments().catch(() => 0),
    db.collection('scholarships').countDocuments().catch(() => 0),
    db.collection('events').countDocuments().catch(() => 0),
    db.collection('placements').countDocuments().catch(() => 0),
    db.collection('alumnis').countDocuments().catch(() => 0),
    db.collection('faculties').countDocuments().catch(() => 0),
    db.collection('inquiries').countDocuments().catch(() => 0),
    db.collection('testimonials').countDocuments().catch(() => 0),
    db.collection('admins').countDocuments().catch(() => 0),
  ]);

  // Recent leads (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLeads = await db.collection('leads').countDocuments({ createdAt: { $gte: weekAgo } }).catch(() => 0);
  const pendingReviews = await db.collection('reviews').countDocuments({ isApproved: false }).catch(() => 0);
  const pendingApps = await db.collection('applications').countDocuments({ status: 'Submitted' }).catch(() => 0);

  return NextResponse.json({
    totals: { colleges, courses, leads, applications, notices, blogs, faqs, reviews, scholarships, events, placements, alumni, faculty, inquiries, testimonials, admins },
    alerts: { recentLeads, pendingReviews, pendingApps },
  });
}
