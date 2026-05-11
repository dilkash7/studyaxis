import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter: any = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

import { rateLimiter } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Prevent Lead Form Spam (Max 5 requests per minute per IP)
    const rateLimitResponse = rateLimiter(req, 5);
    if (rateLimitResponse) return rateLimitResponse;

    await connectDB();
    const body = await req.json();
    const lead = await Lead.create(body);

    // Fire & Forget Welcome Email (non-blocking)
    if (lead.email) {
      sendEmail({
        to: lead.email,
        subject: 'Thank you for contacting StudyAxis!',
        html: `<p>Hi ${lead.name || 'there'},</p>
               <p>We have received your inquiry regarding <b>${lead.courseOfInterest || 'admissions'}</b>.</p>
               <p>Our expert counselling team will review your profile and reach out to you at ${lead.phone || 'your registered number'} very soon.</p>
               <br/>
               <p>Best regards,<br/>The StudyAxis Team</p>`
      }).catch(err => console.error('Welcome email failed:', err));
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    console.error('Lead creation error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
