import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const admins = await Admin.find().select('-password').lean();
    return NextResponse.json(admins);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user || user.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const body = await req.json();

    if (!body.password || body.password.trim() === '') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.password.trim(), 10);
    const admin = await Admin.create({
      name: body.name,
      email: body.email,
      password: hashed,
      role: body.role || 'admin',
      permissions: body.permissions || ['dashboard', 'colleges', 'leads'],
    });

    return NextResponse.json({ success: true, admin });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}