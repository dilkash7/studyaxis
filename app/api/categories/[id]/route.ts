import { connectDB } from '@/lib/mongodb';
import AdmissionCategory from '@/models/AdmissionCategory';
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
    
    const category = await AdmissionCategory.findById(id)
      .populate('collegeId', 'name');
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: category });
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
    const category = await AdmissionCategory.findByIdAndUpdate(id, data, { new: true })
      .populate('collegeId', 'name');
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    await logAdminAction({ action: 'update', module: 'categories', description: `Updated category: ${category.name}`, targetId: id, targetName: category.name });
    return NextResponse.json({ success: true, data: category });
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
    
    const category = await AdmissionCategory.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    await College.findByIdAndUpdate(
      category.collegeId,
      { $pull: { categories: category._id } },
      { new: true }
    );
    
    await logAdminAction({ action: 'delete', module: 'categories', description: `Deleted category: ${category.name}`, targetId: id, targetName: category.name });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
