import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAuth(req);
    // Ensure only superadmins can force logout students (or you can allow any admin if desired)
    if (!adminUser || adminUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden. Superadmin only.' }, { status: 403 });
    }

    await connectDB();
    const { id: studentId } = await params;
    
    // Invalidate session by clearing the session token
    const updatedUser = await User.findByIdAndUpdate(studentId, { sessionToken: null }, { new: true });
    if (!updatedUser) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    await logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      action: 'force_logout',
      module: 'auth',
      description: `Forced logout for student ${updatedUser.email}`,
      ipAddress: req.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({ success: true, message: 'Student session forcefully invalidated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
