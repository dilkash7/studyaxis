import { connectDB } from '@/lib/mongodb';
import AdmissionCategory from '@/models/AdmissionCategory';
import College from '@/models/College';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const collegeId = req.nextUrl.searchParams.get('collegeId');
    const active = req.nextUrl.searchParams.get('active');
    
    let filter: any = {};
    if (collegeId) filter.collegeId = collegeId;
    if (active !== null) filter.active = active === 'true';
    
    const categories = await AdmissionCategory.find(filter)
      .populate('collegeId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: categories });
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
    
    if (!data.collegeId || !data.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: collegeId, name' },
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
    
    const category = new AdmissionCategory({
      ...data,
      collegeName: college.name,
    });
    
    await category.save();
    
    await College.findByIdAndUpdate(
      data.collegeId,
      { $addToSet: { categories: category._id } },
      { new: true }
    );
    
    await logAdminAction({ action: 'create', module: 'categories', description: `Created category: ${data.name} for ${college.name}`, targetId: category._id, targetName: data.name });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
