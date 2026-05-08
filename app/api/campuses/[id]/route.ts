import { connectDB } from '@/lib/mongodb';
import Campus from '@/models/Campus';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const campus = await Campus.findById(id)
      .populate('collegeId', 'name');
    
    if (!campus) {
      return NextResponse.json(
        { success: false, error: 'Campus not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: campus });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const data = await req.json();
    const campus = await Campus.findByIdAndUpdate(id, data, { new: true })
      .populate('collegeId', 'name');
    
    if (!campus) {
      return NextResponse.json(
        { success: false, error: 'Campus not found' },
        { status: 404 }
      );
    }
    
    await logAdminAction({ action: 'update', module: 'campuses', description: `Updated campus: ${campus.name}`, targetId: id, targetName: campus.name });
    return NextResponse.json({ success: true, data: campus });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const campus = await Campus.findByIdAndDelete(id);
    
    if (!campus) {
      return NextResponse.json(
        { success: false, error: 'Campus not found' },
        { status: 404 }
      );
    }
    
    // Remove campus from college's campuses array
    await College.findByIdAndUpdate(
      campus.collegeId,
      { $pull: { campuses: campus._id } },
      { new: true }
    );
    
    await logAdminAction({ action: 'delete', module: 'campuses', description: `Deleted campus: ${campus.name}`, targetId: id, targetName: campus.name });
    return NextResponse.json({ success: true, message: 'Campus deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
