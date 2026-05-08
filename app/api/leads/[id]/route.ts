import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const lead = await Lead.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'leads', description: `Updated lead: ${lead?.name} — status: ${body.status || lead?.status}`, targetId: id, targetName: lead?.name });
    return NextResponse.json({ success: true, lead });
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
    await Lead.findByIdAndDelete(id);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'leads', description: `Deleted lead ID: ${id}`, targetId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}