import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/models/Analytics';
import AdminLog from '@/models/AdminLog';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Basic API Key security for Cron Jobs (Configure this in Vercel)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In local dev, we might bypass this or just return 401
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    await connectDB();

    // 1. Analytics Cleanup: Delete heat-map clicks older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedClicks = await AnalyticsEvent.deleteMany({
      eventType: 'click',
      createdAt: { $lt: thirtyDaysAgo }
    });

    // 2. Admin Logs Cleanup: Archive or delete logs older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const deletedLogs = await AdminLog.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });

    return NextResponse.json({
      success: true,
      message: 'Background cleanup successful',
      deletedClicks: deletedClicks.deletedCount,
      deletedLogs: deletedLogs.deletedCount
    });

  } catch (err) {
    console.error('Cron job error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
