import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const tickets = await Ticket.find({ studentId: userPayload.id }).sort({ lastMessageAt: -1 }).lean();

    return NextResponse.json({ success: true, tickets });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload || userPayload.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await req.json();
    const { ticketId, subject, message } = data;

    if (!message) return NextResponse.json({ error: 'Message content is required' }, { status: 400 });

    const user = await User.findById(userPayload.id).select('name email').lean();

    const newMessage = {
      sender: 'student',
      senderName: user.name,
      content: message,
      timestamp: new Date()
    };

    if (ticketId) {
      // Reply to existing ticket
      const ticket = await Ticket.findOneAndUpdate(
        { _id: ticketId, studentId: userPayload.id },
        { 
          $push: { messages: newMessage },
          lastMessageAt: new Date(),
          unreadByAdmin: true,
          status: 'Open' // reopen if closed
        },
        { new: true }
      );
      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      return NextResponse.json({ success: true, ticket });
    } else {
      // Create new ticket
      if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
      const ticket = await Ticket.create({
        studentId: userPayload.id,
        studentName: user.name,
        studentEmail: user.email,
        subject,
        messages: [newMessage]
      });
      return NextResponse.json({ success: true, ticket });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
