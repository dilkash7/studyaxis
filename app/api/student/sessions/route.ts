import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, signToken } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const userPayload = requireAuth(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(userPayload.id).select('lastLogin createdAt').lean();
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Return session info (in future, track multiple devices)
    return NextResponse.json({
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt,
      currentSessionToken: userPayload.sessionToken,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Extend session (keep user logged in)
export async function POST(req: NextRequest) {
  try {
    const userPayload = requireAuth(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(userPayload.id);
    
    if (!user || !user.isActive) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Create new token with extended expiration
    const newToken = signToken({ 
      id: user._id, 
      role: 'student', 
      sessionToken: user.sessionToken 
    }, '7d');

    const res = NextResponse.json({ success: true, token: newToken });
    res.cookies.set('studentToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
