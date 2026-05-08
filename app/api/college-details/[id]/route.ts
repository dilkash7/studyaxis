import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CollegeDetail from '@/models/CollegeDetail';

// GET: Fetch college detail sections by collegeId
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    let detail = await CollegeDetail.findOne({ collegeId: id }).lean();
    if (!detail) {
      return NextResponse.json({ sections: [], faqs: [] });
    }
    return NextResponse.json(detail);
  } catch (err: any) {
    console.error('CollegeDetail GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update/create college detail sections
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const detail = await CollegeDetail.findOneAndUpdate(
      { collegeId: id },
      {
        $set: {
          collegeId: id,
          collegeName: body.collegeName,
          sections: body.sections || [],
          faqs: body.faqs || [],
          source: body.source,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: detail });
  } catch (err: any) {
    console.error('CollegeDetail PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
