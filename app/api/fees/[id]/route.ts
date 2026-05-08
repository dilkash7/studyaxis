import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Fees from '@/models/Fees';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

// Helper: clean empty ObjectId fields
function cleanBody(body: any) {
  const cleaned = { ...body };
  const objectIdFields = ['courseId', 'collegeId', 'campusId', 'admissionCategory'];
  for (const field of objectIdFields) {
    if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
      delete cleaned[field];
    }
  }
  // Remove internal _id from yearWiseFees to avoid cast errors on update
  if (Array.isArray(cleaned.yearWiseFees)) {
    cleaned.yearWiseFees = cleaned.yearWiseFees.map((r: any) => ({
      label: r.label || '',
      amount: r.amount || '',
    }));
  }
  // Remove _id from source sub-doc if present
  if (cleaned.source && cleaned.source._id) delete cleaned.source._id;
  // Remove Mongoose meta fields
  delete cleaned._id;
  delete cleaned.__v;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  return cleaned;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const cleaned = cleanBody(body);
    const fees = await Fees.findByIdAndUpdate(id, cleaned, { returnDocument: 'after', runValidators: true });
    if (!fees) return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'update', module: 'fees', description: `Updated fee record`, targetId: id });
    return NextResponse.json({ success: true, fees });
  } catch (err: any) {
    console.error('Fees PUT error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    await Fees.findByIdAndDelete(id);
    await logAdminAction({ adminId: user.id, adminName: user.name, action: 'delete', module: 'fees', description: `Deleted fee record`, targetId: id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Fees DELETE error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}