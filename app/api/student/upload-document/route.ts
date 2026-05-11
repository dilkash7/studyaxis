import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { applicationId, documentName, documentUrl } = body;

    if (!applicationId || !documentName || !documentUrl) {
      return NextResponse.json({ error: 'Missing document details' }, { status: 400 });
    }

    // Ensure the application actually belongs to this student
    const application = await Application.findOne({ _id: applicationId, userId: userPayload.id });
    if (!application) {
      return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 });
    }

    // Add document to the array and update status if it was "Documents Pending"
    const updatedApp = await Application.findByIdAndUpdate(
      applicationId,
      { 
        $push: { documents: { name: documentName, url: documentUrl, verified: false } },
        $set: { status: application.status === 'Documents Pending' ? 'Under Review' : application.status }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, application: updatedApp });

  } catch (err: any) {
    console.error('Document Upload Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
