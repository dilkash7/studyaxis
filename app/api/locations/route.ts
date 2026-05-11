import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Location from '@/models/Location';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const filter: any = {};
    if (type) filter.type = type;
    const locations = await Location.find(filter).lean();
    return NextResponse.json(locations);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const location = await Location.create(body);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'locations', description: `Created location: ${body.name}`, targetId: location._id, targetName: body.name });
    return NextResponse.json({ success: true, location });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
