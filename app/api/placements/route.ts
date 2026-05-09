import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Placement from '@/models/Placement';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  const placements = await Placement.find(filter).sort({ year: -1, packageLPA: -1 }).lean();
  return NextResponse.json(placements);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const placement = await Placement.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'placements', description: `Added placement: ${body.company} - ${body.package}` });
  return NextResponse.json(placement, { status: 201 });
}
