import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = requireAuth(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const student = await User.findById(userPayload.id).select('-password').lean();
    
    if (!student || !student.isActive) {
      return NextResponse.json({ error: 'Account disabled' }, { status: 401 });
    }

    // Allow multi-device sessions (don't validate sessionToken match)
    return NextResponse.json({
      id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
