import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user || user.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    await connectDB();
    const body = await req.json();

    // ✅ CRITICAL: Never overwrite password with empty value
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
      permissions: body.permissions,
    };

    // Only update password if a new one was provided
    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password.trim(), 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).select('-password');
    return NextResponse.json({ success: true, admin });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user || user.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    await connectDB();
    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}