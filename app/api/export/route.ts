import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { toCSV } from '@/lib/export';

// Dynamic model imports
const modelMap: Record<string, () => Promise<any>> = {
  colleges: () => import('@/models/College').then(m => m.default),
  courses: () => import('@/models/Course').then(m => m.default),
  fees: () => import('@/models/Fees').then(m => m.default),
  leads: () => import('@/models/Lead').then(m => m.default),
  applications: () => import('@/models/Application').then(m => m.default),
  payments: () => import('@/models/Payment').then(m => m.default),
  'student-records': () => import('@/models/StudentRecord').then(m => m.default),
  notices: () => import('@/models/Notice').then(m => m.default),
  blogs: () => import('@/models/Blog').then(m => m.default),
  faqs: () => import('@/models/FAQ').then(m => m.default),
  reviews: () => import('@/models/Review').then(m => m.default),
  scholarships: () => import('@/models/Scholarship').then(m => m.default),
  testimonials: () => import('@/models/Testimonial').then(m => m.default),
  events: () => import('@/models/Event').then(m => m.default),
  placements: () => import('@/models/Placement').then(m => m.default),
  alumni: () => import('@/models/Alumni').then(m => m.default),
  faculty: () => import('@/models/Faculty').then(m => m.default),
  inquiries: () => import('@/models/Inquiry').then(m => m.default),
  campuses: () => import('@/models/Campus').then(m => m.default),
  brochures: () => import('@/models/CollegeBrochure').then(m => m.default),
  hostels: () => import('@/models/Hostel').then(m => m.default),
};

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module');
  const format = searchParams.get('format') || 'json';

  if (!module || !modelMap[module]) {
    return NextResponse.json({ error: 'Invalid module', available: Object.keys(modelMap) }, { status: 400 });
  }

  const Model = await modelMap[module]();
  const data = await Model.find().lean();

  if (format === 'csv') {
    const csv = toCSV(data);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${module}_export.csv"`,
      },
    });
  }

  return NextResponse.json(data);
}
