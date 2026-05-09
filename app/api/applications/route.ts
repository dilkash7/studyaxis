import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';
import Application from '@/models/Application';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: any = {};
  if (searchParams.get('status')) filter.status = searchParams.get('status');
  if (searchParams.get('collegeId')) filter.college = searchParams.get('collegeId');
  if (searchParams.get('phone')) filter.phone = searchParams.get('phone');
  return NextResponse.json(await Application.find(filter).sort({ submittedAt: -1 }).lean());
}

export async function POST(req: NextRequest) {
  try {
    // Public — students can submit applications
    await connectDB();
    const body = await req.json();
    if (!body.studentName || !body.phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
    const app = await Application.create(body);
    return NextResponse.json({ success: true, applicationNumber: app.applicationNumber, message: 'Application submitted successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('Application creation error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
