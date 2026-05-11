import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Prevent users from changing their password or critical security fields through this route
    const safeUpdates: any = {
      name: body.name,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      highestQualification: body.highestQualification,
      percentage: body.percentage,
      passingYear: body.passingYear
    };

    // Remove undefined fields
    Object.keys(safeUpdates).forEach(key => {
      if (safeUpdates[key] === undefined) delete safeUpdates[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userPayload.id,
      { $set: safeUpdates },
      { new: true }
    ).select('-password');

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (err: any) {
    console.error('Student Profile Update Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
