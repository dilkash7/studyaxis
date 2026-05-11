import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/models/Analytics';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Total Pageviews in last 7 days
    const totalPageviews = await AnalyticsEvent.countDocuments({
      eventType: 'pageview',
      createdAt: { $gte: sevenDaysAgo }
    });

    // 2. Active Sessions (unique sessionIds in last 24h)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
    const activeSessions = await AnalyticsEvent.distinct('sessionId', {
      createdAt: { $gte: twentyFourHoursAgo }
    }).then(res => res.length);

    // 3. Top Viewed Pages
    const topPages = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'pageview', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // 4. Top Clicked Elements (Funnel/Engagement)
    const topClicks = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'click', createdAt: { $gte: sevenDaysAgo }, elementText: { $exists: true, $ne: '' } } },
      { $group: { _id: '$elementText', clicks: { $sum: 1 }, path: { $first: '$path' } } },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    // 5. Device Breakdown
    const devices = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'pageview', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPageviews,
        activeSessions,
        topPages,
        topClicks,
        devices
      }
    });

  } catch (err) {
    console.error('Analytics Dashboard Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
