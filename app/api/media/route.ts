import { connectDB } from '@/lib/mongodb';
import CollegeMedia from '@/models/CollegeMedia';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const collegeId = req.nextUrl.searchParams.get('collegeId');
    const campusId = req.nextUrl.searchParams.get('campusId');
    const mediaType = req.nextUrl.searchParams.get('mediaType');
    
    let filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    if (campusId) filter.campusId = campusId;
    if (mediaType) filter.mediaType = mediaType;
    filter.active = true;
    
    const media = await CollegeMedia.find(filter)
      .populate('collegeId', 'name')
      .populate('campusId', 'name')
      .sort({ displayOrder: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const data = await req.json();
    
    if (!data.collegeId || !data.title || !data.mediaUrl || !data.mediaType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const college = await College.findById(data.collegeId);
    if (!college) {
      return NextResponse.json(
        { success: false, error: 'College not found' },
        { status: 404 }
      );
    }
    
    // Strip empty optional ObjectId fields
    if (!data.campusId) { delete data.campusId; delete data.campusName; }

    const media = new CollegeMedia({
      ...data,
      collegeName: college.name,
    });
    
    await media.save();
    
    await College.findByIdAndUpdate(
      data.collegeId,
      { $addToSet: { media: media._id } },
      { new: true }
    );

    await logAdminAction({ action: 'upload', module: 'media', description: `Uploaded media: ${data.title}`, targetId: media._id, targetName: data.title });
    
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error: any) {
    console.error('Media POST error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
