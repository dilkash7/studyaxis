import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';

/**
 * WhatsApp Lead Capture — creates a lead when someone clicks WhatsApp contact
 * Also serves as a universal callback request endpoint
 */
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  if (!body.phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

  // Check if lead already exists
  const existing = await Lead.findOne({ phone: body.phone });
  if (existing) {
    // Update callback request
    await Lead.findByIdAndUpdate(existing._id, {
      callbackRequested: true,
      callbackTime: body.callbackTime ? new Date(body.callbackTime) : new Date(),
      ...(body.name && !existing.name ? { name: body.name } : {}),
      ...(body.course ? { course: body.course } : {}),
    });
    return NextResponse.json({ success: true, message: 'Callback scheduled', existing: true });
  }

  // Create new lead
  await Lead.create({
    name: body.name || 'WhatsApp Lead',
    phone: body.phone,
    email: body.email || '',
    course: body.course || '',
    college: body.college || '',
    source: body.source || 'WhatsApp',
    status: 'New',
    callbackRequested: body.callback || false,
    callbackTime: body.callbackTime ? new Date(body.callbackTime) : undefined,
    notes: body.message || '',
  });

  return NextResponse.json({ success: true, message: 'We will contact you soon!' }, { status: 201 });
}
