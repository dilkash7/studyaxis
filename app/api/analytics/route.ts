import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/models/Analytics';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const event = new AnalyticsEvent({
      ...body,
      ipHash,
    });
    
    await event.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analytics ingest error:', err);
    return NextResponse.json({ error: 'Failed to ingest event' }, { status: 500 });
  }
}
