import { connectDB } from '@/lib/mongodb';
import StudentRecord from '@/models/StudentRecord';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

function checkAccess(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.role === 'superadmin' || payload.detailedPermissions?.studentRecords === true) return payload;
  return null;
}

// POST: Add document to student
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = checkAccess(req);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const data = await req.json();

    if (!data.documentType || !data.fileUrl) {
      return NextResponse.json({ success: false, error: 'documentType and fileUrl required' }, { status: 400 });
    }

    const student = await StudentRecord.findByIdAndUpdate(id, {
      $push: {
        documents: {
          documentType: data.documentType,
          fileName: data.fileName || '',
          fileUrl: data.fileUrl,
          cloudinaryPublicId: data.cloudinaryPublicId || '',
          fileSize: data.fileSize || 0,
          uploadedBy: payload.id,
          uploadedByName: payload.name || '',
          verificationStatus: 'pending',
          adminNotes: data.adminNotes || '',
        },
      },
    }, { new: true });

    if (!student) return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Fetch student documents
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = checkAccess(req);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const student = await StudentRecord.findById(id);
    if (!student) return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: student.documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update document verification status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = checkAccess(req);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const { documentId, verificationStatus, adminNotes } = await req.json();

    if (!documentId) return NextResponse.json({ success: false, error: 'documentId required' }, { status: 400 });

    const student = await StudentRecord.findOneAndUpdate(
      { _id: id, 'documents._id': documentId },
      {
        $set: {
          'documents.$.verificationStatus': verificationStatus || 'pending',
          'documents.$.adminNotes': adminNotes || '',
          'documents.$.verifiedBy': payload.name || '',
          'documents.$.verifiedAt': new Date(),
        },
      },
      { new: true }
    );
    if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove document
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = checkAccess(req);
    if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const docId = req.nextUrl.searchParams.get('docId');
    if (!docId) return NextResponse.json({ success: false, error: 'docId required' }, { status: 400 });

    const student = await StudentRecord.findByIdAndUpdate(id,
      { $pull: { documents: { _id: docId } } },
      { new: true }
    );
    if (!student) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
