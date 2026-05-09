import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Inquiry from '@/models/Inquiry';

export async function GET(req: NextRequest) {
  await connectDB();
  const status = new URL(req.url).searchParams.get('status');
  const filter = status ? { status } : {};
  return NextResponse.json(await Inquiry.find(filter).sort({ createdAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  // Public — students submit inquiries
  await connectDB();
  const body = await req.json();
  if (!body.name || !body.phone || !body.message) return NextResponse.json({ error: 'Name, phone, and message required' }, { status: 400 });
  const inquiry = await Inquiry.create(body);
  return NextResponse.json({ success: true, message: 'Inquiry submitted. We will contact you soon!' }, { status: 201 });
}
