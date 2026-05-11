import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logAdminAction } from '@/lib/adminLog';
import crypto from 'crypto';
import { rateLimiter } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Prevent Brute Force Login Attacks (Max 5 attempts per minute)
    const rateLimitResponse = rateLimiter(req, 5);
    if (rateLimitResponse) return rateLimitResponse;

    await connectDB();
    const { email, password } = await req.json();

    const admin = await Admin.findOne({ email });
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const sessionToken = crypto.randomUUID();
    
    // Update active session and last login
    await Admin.findByIdAndUpdate(admin._id, { 
      lastLogin: new Date(),
      sessionToken 
    });

    const token = signToken({ 
      id: admin._id, 
      email: admin.email, 
      role: admin.role, 
      name: admin.name,
      sessionToken 
    }, '2h'); // 2 hour idle timeout for admins

    // Update last login timestamp
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    await logAdminAction({
      adminId: admin._id, adminName: admin.name, adminEmail: admin.email,
      action: 'login', module: 'auth', description: `${admin.name} logged in`,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
    });

    const res = NextResponse.json({ success: true, token, admin: { name: admin.name, email: admin.email, role: admin.role } });
    // 2 hours cookie expiry
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
      path: '/',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('token');
  return res;
}
