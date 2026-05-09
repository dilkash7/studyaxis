import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import StudentRecord from '@/models/StudentRecord';
import Payment from '@/models/Payment';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const appNumber = searchParams.get('appNumber');

    if (!phone && !appNumber) {
      return NextResponse.json({ error: 'Phone or application number required' }, { status: 400 });
    }

    const appFilter: any = {};
    if (phone) appFilter.phone = phone;
    if (appNumber) appFilter.applicationNumber = appNumber;

    const applications = await Application.find(appFilter).sort({ submittedAt: -1 }).lean();

    // If no applications found, return early
    if (!applications.length) {
      return NextResponse.json({ applications: [], records: [], payments: [] });
    }

    // Use the exact phone from the application to find records and payments
    const targetPhone = applications[0].phone || phone;

    const [records, payments] = await Promise.all([
      StudentRecord.find({ phone: targetPhone }).lean(),
      Payment.find({ phone: targetPhone }).lean()
    ]);

    return NextResponse.json({
      applications,
      records,
      payments
    });

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
