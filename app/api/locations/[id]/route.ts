import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Location from '@/models/Location';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const location = await Location.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'locations', description: `Updated location: ${location?.name}`, targetId: id });
    return NextResponse.json({ success: true, location });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    await Location.findByIdAndDelete(id);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'locations', description: `Deleted location ID: ${id}`, targetId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}