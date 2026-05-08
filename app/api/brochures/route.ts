import { connectDB } from '@/lib/mongodb';
import CollegeBrochure from '@/models/CollegeBrochure';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const collegeId = req.nextUrl.searchParams.get('collegeId');
    const campusId = req.nextUrl.searchParams.get('campusId');
    const documentType = req.nextUrl.searchParams.get('documentType');
    
    let filter: any = { active: true };
    if (collegeId) filter.collegeId = collegeId;
    if (campusId) filter.campusId = campusId;
    if (documentType) filter.documentType = documentType;
    
    const brochures = await CollegeBrochure.find(filter)
      .populate('collegeId', 'name')
      .populate('campusId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: brochures });
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
    
    if (!data.collegeId || !data.title || !data.fileUrl || !data.documentType) {
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

    const brochure = new CollegeBrochure({
      ...data,
      collegeName: college.name,
      downloadCount: 0,
      viewCount: 0,
    });
    
    await brochure.save();
    
    await College.findByIdAndUpdate(
      data.collegeId,
      { $addToSet: { brochures: brochure._id } },
      { new: true }
    );

    await logAdminAction({ action: 'upload', module: 'brochures', description: `Uploaded brochure: ${data.title}`, targetId: brochure._id, targetName: data.title });
    
    return NextResponse.json({ success: true, data: brochure }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
