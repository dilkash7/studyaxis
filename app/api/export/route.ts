import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();

    const headers = ['Name', 'Phone', 'Email', 'Course', 'Location', 'College', 'Status', 'Notes', 'Date'];
    const rows = leads.map((l: any) => [
      l.name, l.phone, l.email, l.course, l.location, l.college, l.status, l.notes,
      new Date(l.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c || ''}"`).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=leads.csv',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}