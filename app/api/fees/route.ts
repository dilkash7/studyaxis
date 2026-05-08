import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Fees from '@/models/Fees';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

// Helper: clean empty ObjectId fields so Mongoose doesn't choke
function cleanBody(body: any) {
  const cleaned = { ...body };
  // Strip empty string ObjectId fields
  const objectIdFields = ['courseId', 'collegeId', 'campusId', 'admissionCategory'];
  for (const field of objectIdFields) {
    if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
      delete cleaned[field];
    }
  }
  // Strip _id from yearWiseFees items (Mongoose generates these)
  if (Array.isArray(cleaned.yearWiseFees)) {
    cleaned.yearWiseFees = cleaned.yearWiseFees.map((r: any) => ({
      label: r.label || '',
      amount: r.amount || '',
    }));
  }
  return cleaned;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const collegeId = searchParams.get('collegeId');
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (collegeId) filter.collegeId = collegeId;
    const fees = await Fees.find(filter).lean();
    return NextResponse.json(fees);
  } catch (err: any) {
    console.error('Fees GET error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const cleaned = cleanBody(body);
    const fees = await Fees.create(cleaned);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'create', module: 'fees', description: `Created fee record`, targetId: fees._id });
    return NextResponse.json({ success: true, fees });
  } catch (err: any) {
    console.error('Fees POST error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}