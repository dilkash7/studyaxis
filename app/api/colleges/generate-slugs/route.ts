import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import College from '@/models/College';

/**
 * Generate slugs for all colleges that don't have one yet.
 * GET /api/colleges/generate-slugs  (one-time backfill)
 * POST /api/colleges/generate-slugs (admin authenticated)
 */

async function generateSlugs() {
  await connectDB();
  const colleges = await College.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] });
  let generated = 0;
  const results: string[] = [];

  for (const college of colleges) {
    try {
      await college.save();
      generated++;
      results.push(`✅ ${college.name} → ${college.slug}`);
    } catch (err: any) {
      results.push(`❌ ${college.name}: ${err.message}`);
      console.error(`Slug gen failed for ${college.name}:`, err.message);
    }
  }

  return { generated, total: colleges.length, results };
}

export async function GET() {
  const data = await generateSlugs();
  return NextResponse.json({
    success: true,
    ...data,
    message: `Generated slugs for ${data.generated}/${data.total} colleges`,
  });
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await generateSlugs();

  await logAdminAction({
    adminId: user.id, adminName: user.name,
    action: 'update', module: 'colleges',
    description: `Generated slugs for ${data.generated} colleges`,
  });

  return NextResponse.json({
    success: true,
    ...data,
    message: `Generated slugs for ${data.generated}/${data.total} colleges`,
  });
}
