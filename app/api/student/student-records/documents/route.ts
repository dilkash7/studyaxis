import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudentRecord from '@/models/StudentRecord';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    const { recordId, documentType, fileUrl, fileName, fileSize } = data;
    if (!recordId || !documentType || !fileUrl) {
      return NextResponse.json({ error: 'Missing required document fields' }, { status: 400 });
    }

    const { default: User } = await import('@/models/User');
    const user = await User.findById(userPayload.id).select('email name').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Ensure the student record belongs to this user (via email match)
    const record = await StudentRecord.findOne({ _id: recordId, email: user.email });
    if (!record) {
      return NextResponse.json({ error: 'Record not found or unauthorized' }, { status: 404 });
    }

    const newDoc = {
      documentType,
      fileUrl,
      fileName,
      fileSize,
      verificationStatus: 'pending',
      uploadedAt: new Date(),
      uploadedByName: user.name
    };

    record.documents.push(newDoc);
    await record.save();

    return NextResponse.json({ success: true, document: record.documents[record.documents.length - 1] });
  } catch (err: any) {
    console.error('Student Document Upload API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
