import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { signToken } from '@/lib/auth';
import { rateLimiter } from '@/lib/rateLimit';

// Register or Login Student
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = rateLimiter(req, 10);
    if (rateLimitResponse) return rateLimitResponse;

    await connectDB();
    const body = await req.json();
    const { action, email, password, name, phone } = body;

    if (action === 'register') {
      // Validate
      if (!email || !password || !name || !phone) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return NextResponse.json({ error: 'Email or phone already registered' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const sessionToken = crypto.randomUUID();

      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        sessionToken,
        lastLogin: new Date()
      });

      const token = signToken({ id: user._id, role: 'student', sessionToken });
      
      const res = NextResponse.json({ success: true, token, user: { id: user._id, name, email } });
      res.cookies.set('studentToken', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
      return res;
    } 
    
    if (action === 'login') {
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      if (!user.isActive) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      const sessionToken = crypto.randomUUID();
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date(), sessionToken });

      const token = signToken({ id: user._id, role: 'student', sessionToken });

      const res = NextResponse.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
      res.cookies.set('studentToken', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
      return res;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err: any) {
    console.error('Student Auth Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
