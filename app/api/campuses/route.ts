import { connectDB } from '@/lib/mongodb';
import Campus from '@/models/Campus';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const collegeId = req.nextUrl.searchParams.get('collegeId');
    const active = req.nextUrl.searchParams.get('active');
    
    let filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    if (active !== null) filter.active = active === 'true';
    
    const campuses = await Campus.find(filter)
      .populate('collegeId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: campuses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.collegeId || !data.name || !data.city) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: collegeId, name, city' },
        { status: 400 }
      );
    }
    
    // Verify college exists
    const college = await College.findById(data.collegeId);
    if (!college) {
      return NextResponse.json(
        { success: false, error: 'College not found' },
        { status: 404 }
      );
    }
    
    // Create campus with college name
    const campus = new Campus({
      ...data,
      collegeName: college.name,
    });
    
    await campus.save();
    
    // Add campus to college's campuses array
    await College.findByIdAndUpdate(
      data.collegeId,
      { $addToSet: { campuses: campus._id } },
      { new: true }
    );
    
    await logAdminAction({ adminId: user?.id, adminName: user?.name, action: 'create', module: 'campuses', description: `Created campus: ${data.name}`, targetId: campus._id, targetName: data.name });
    return NextResponse.json({ success: true, data: campus }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
