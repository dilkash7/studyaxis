import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ active: true }).sort({ order: 1 }).lean();
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const service = await Service.create(body);
    return NextResponse.json({ success: true, service });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}