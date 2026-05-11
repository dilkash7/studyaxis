import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized. Please log in as a student to apply.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Ensure they don't apply to the same course in the same college twice
    const existingApp = await Application.findOne({
      userId: userPayload.id,
      college: body.college,
      course: body.course
    });

    if (existingApp) {
      return NextResponse.json({ error: 'You have already applied for this course at this college.' }, { status: 400 });
    }

    // Create the formal application tied to the student's User Account
    const newApplication = await Application.create({
      ...body,
      userId: userPayload.id,
      email: userPayload.email, // Use verified account email
      status: 'Submitted',
      source: 'Student Portal'
    });

    return NextResponse.json({ success: true, application: newApplication });

  } catch (err: any) {
    console.error('Student Application Submit Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
