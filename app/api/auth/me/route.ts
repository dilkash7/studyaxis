import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const admin = await Admin.findById(userPayload.id).lean();
    
    // Check if user exists and is active (checking both 'active' and 'isActive' for backward compatibility with seeded admins)
    if (!admin || (admin.isActive === false && admin.active === false)) {
      return NextResponse.json({ error: 'Session invalidated' }, { status: 401 });
    }

    // Strict Session Token Validation for Force Logout
    if (admin.sessionToken && userPayload.sessionToken !== admin.sessionToken) {
      return NextResponse.json({ error: 'Session expired by Superadmin' }, { status: 401 });
    }

    return NextResponse.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      detailedPermissions: admin.detailedPermissions
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
