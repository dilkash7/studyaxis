import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized. Please log in as a student.' }, { status: 401 });
    }

    await connectDB();
    const { collegeId, action } = await req.json();

    if (!collegeId || !['save', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updateQuery = action === 'save' 
      ? { $addToSet: { savedColleges: collegeId } }
      : { $pull: { savedColleges: collegeId } };

    const updatedUser = await User.findByIdAndUpdate(
      userPayload.id,
      updateQuery,
      { new: true }
    ).select('savedColleges');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      savedColleges: updatedUser.savedColleges 
    });

  } catch (err: any) {
    console.error('Save College Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
