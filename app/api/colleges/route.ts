import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import { requireAuth } from '@/lib/auth';
import { logAdminAction } from '@/lib/adminLog';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: any = {};
    if (type) filter.type = type;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (featured) filter.featured = true;

    const colleges = await College.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(colleges);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
import { generateSlug, generateSEO } from '@/lib/courseClassifier';

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();

    // Auto-generate slug + SEO
    if (!body.slug && body.name) body.slug = generateSlug(body.name);
    if (!body.metaTitle && body.name) {
      const seo = generateSEO(body.name);
      body.metaTitle = seo.metaTitle;
      body.metaDescription = seo.metaDescription;
    }

    const college = await College.create(body);
    await logAdminAction({ adminId: user.id, adminName: user.name, adminEmail: user.email, action: 'create', module: 'colleges', description: `Created college: ${body.name}`, targetId: college._id, targetName: body.name });
    return NextResponse.json({ success: true, college });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}