import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

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

    // Allow multiple device sessions.
    // Only reject if the admin session has been explicitly cleared by force logout.
    if (admin.sessionToken === null) {
      await logAdminAction({
        adminId: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        action: 'auto_logout',
        module: 'auth',
        description: 'Session invalidated by force logout',
        targetId: admin._id,
        targetName: admin.name,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
      });
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
