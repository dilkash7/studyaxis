import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { applicationId, amount } = await req.json();

    if (!applicationId || !amount) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify ownership
    const application = await Application.findOne({ _id: applicationId, userId: userPayload.id });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // ─── START MOCK RAZORPAY / STRIPE LOGIC ───
    // In production, you would call Razorpay Orders API here and return the order_id.
    // For now, we simulate an instant successful transaction.
    const mockTransactionId = `txn_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Record Payment
    const payment = await Payment.create({
      userId: userPayload.id,
      applicationId: application._id,
      student: userPayload.name,
      phone: application.phone,
      email: application.email || userPayload.email,
      college: application.college,
      collegeName: application.collegeName,
      course: application.course,
      amount: amount,
      type: 'Application Fee',
      status: 'Completed', // Simulating instant success
      transactionId: mockTransactionId,
      paidAt: new Date(),
      method: 'Online'
    });

    // Automatically push application state to "Fee Paid"
    await Application.findByIdAndUpdate(applicationId, {
      status: 'Fee Paid'
    });

    return NextResponse.json({ 
      success: true, 
      paymentId: payment._id,
      receipt: payment.receiptNumber,
      message: 'Payment mock successful. Status updated.'
    });

  } catch (err: any) {
    console.error('Payment Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
