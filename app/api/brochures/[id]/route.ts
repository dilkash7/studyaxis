import { connectDB } from '@/lib/mongodb';
import CollegeBrochure from '@/models/CollegeBrochure';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const brochure = await CollegeBrochure.findById(id)
      .populate('collegeId', 'name')
      .populate('campusId', 'name');
    
    if (!brochure) {
      return NextResponse.json(
        { success: false, error: 'Brochure not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await CollegeBrochure.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } }
    );
    
    return NextResponse.json({ success: true, data: brochure });
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
    const brochure = await CollegeBrochure.findByIdAndUpdate(id, data, { new: true })
      .populate('collegeId', 'name')
      .populate('campusId', 'name');
    
    if (!brochure) {
      return NextResponse.json(
        { success: false, error: 'Brochure not found' },
        { status: 404 }
      );
    }
    
    await logAdminAction({ action: 'update', module: 'brochures', description: `Updated brochure: ${brochure.title}`, targetId: id, targetName: brochure.title });
    return NextResponse.json({ success: true, data: brochure });
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
    
    const brochure = await CollegeBrochure.findByIdAndDelete(id);
    
    if (!brochure) {
      return NextResponse.json(
        { success: false, error: 'Brochure not found' },
        { status: 404 }
      );
    }
    
    await College.findByIdAndUpdate(
      brochure.collegeId,
      { $pull: { brochures: brochure._id } },
      { new: true }
    );
    
    await logAdminAction({ action: 'delete', module: 'brochures', description: `Deleted brochure: ${brochure.title}`, targetId: id, targetName: brochure.title });
    return NextResponse.json({ success: true, message: 'Brochure deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Track download count
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    await CollegeBrochure.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } }
    );
    
    return NextResponse.json({ success: true, message: 'Download recorded' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
