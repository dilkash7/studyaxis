import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden. Superadmin only.' }, { status: 403 });
    }

    await connectDB();
    const { id: adminId } = await params;
    
    // Invalidate session by clearing the session token
    const updated = await Admin.findByIdAndUpdate(adminId, { sessionToken: null }, { new: true });
    if (!updated) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    await logAdminAction({
      adminId: user.id,
      adminName: user.name,
      adminEmail: user.email,
      action: 'force_logout',
      module: 'auth',
      description: `Forced logout for admin ${updated.email}`,
      ipAddress: req.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json({ success: true, message: 'Session forcefully invalidated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
