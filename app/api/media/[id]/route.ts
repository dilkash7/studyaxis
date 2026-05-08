import { connectDB } from '@/lib/mongodb';
import CollegeMedia from '@/models/CollegeMedia';
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
    
    const media = await CollegeMedia.findById(id)
      .populate('collegeId', 'name')
      .populate('campusId', 'name');
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: media });
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
    const media = await CollegeMedia.findByIdAndUpdate(id, data, { new: true })
      .populate('collegeId', 'name')
      .populate('campusId', 'name');
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }
    
    await logAdminAction({ action: 'update', module: 'media', description: `Updated media: ${media.title}`, targetId: id, targetName: media.title });
    return NextResponse.json({ success: true, data: media });
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
    
    const media = await CollegeMedia.findByIdAndDelete(id);
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }
    
    await College.findByIdAndUpdate(
      media.collegeId,
      { $pull: { media: media._id } },
      { new: true }
    );
    
    await logAdminAction({ action: 'delete', module: 'media', description: `Deleted media: ${media.title}`, targetId: id, targetName: media.title });
    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
