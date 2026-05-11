import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = requireAuth(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Clear session by setting sessionToken to null
    await User.findByIdAndUpdate(userPayload.id, { sessionToken: null });

    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
    res.cookies.delete('studentToken');
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
