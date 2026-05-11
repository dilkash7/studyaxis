import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Ticket from '@/models/Ticket';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPayload = await requireAuth(req);
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const { message } = await req.json();

    if (!message) return NextResponse.json({ error: 'Message content is required' }, { status: 400 });

    const newMessage = {
      sender: 'admin',
      senderName: adminPayload.name,
      content: message,
      timestamp: new Date()
    };

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        $push: { messages: newMessage },
        lastMessageAt: new Date(),
        unreadByStudent: true,
        unreadByAdmin: false,
        status: 'Open' // auto reopen on reply
      },
      { new: true }
    );

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPayload = await requireAuth(req);
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const data = await req.json();

    const ticket = await Ticket.findByIdAndUpdate(id, data, { new: true });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPayload = await requireAuth(req);
    if (!adminPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    await Ticket.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Ticket deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
