import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import College from '@/models/College';

/**
 * Generate slugs for all colleges that don't have one yet.
 * POST /api/colleges/generate-slugs
 */
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const colleges = await College.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] });
  let generated = 0;

  for (const college of colleges) {
    try {
      // Trigger the pre-save hook which auto-generates slug
      await college.save();
      generated++;
    } catch (err: any) {
      console.error(`Slug gen failed for ${college.name}:`, err.message);
    }
  }

  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'update', module: 'colleges',
    description: `Generated slugs for ${generated} colleges`,
  });

  return NextResponse.json({
    success: true,
    generated,
    total: colleges.length,
    message: `Generated slugs for ${generated}/${colleges.length} colleges`,
  });
}
