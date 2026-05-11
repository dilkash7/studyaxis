import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
  try {
    const adminPayload = await requireAuth(req);
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const tickets = await Ticket.find().sort({ lastMessageAt: -1 }).lean();

    return NextResponse.json({ success: true, tickets });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
