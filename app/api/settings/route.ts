import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.find().lean();
    const obj: any = {};
    settings.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json(obj);
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
    for (const [key, value] of Object.entries(body)) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value, label: key },
        { upsert: true, new: true }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}