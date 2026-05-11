import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Payment from '@/models/Payment';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: any = {};
  if (searchParams.get('phone')) filter.phone = searchParams.get('phone');
  if (searchParams.get('status')) filter.status = searchParams.get('status');
  return NextResponse.json(await Payment.find(filter).sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  body.recordedBy = user.name;
  if (body.status === 'Completed') body.paidAt = new Date();
  const payment = await Payment.create(body);
  await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'payments', description: `Payment ₹${body.amount} - ${payment.receiptNumber}` });
  return NextResponse.json(payment, { status: 201 });
}
