import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import TransportRoute from '@/models/TransportRoute';

export async function GET(req: NextRequest) {
  await connectDB();
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  const filter = collegeId ? { college: collegeId } : {};
  return NextResponse.json(await TransportRoute.find(filter).sort({ routeName: 1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const route = await TransportRoute.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'transport', description: `Created route: ${body.routeName}` });
  return NextResponse.json(route, { status: 201 });
}
