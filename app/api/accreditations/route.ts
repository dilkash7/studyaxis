import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Accreditation from '@/models/Accreditation';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  return NextResponse.json(await Accreditation.find(filter).sort({ type: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const acc = await Accreditation.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'accreditations', description: `Added ${body.type}: ${body.grade || body.rank}` });
  return NextResponse.json(acc, { status: 201 });
}
