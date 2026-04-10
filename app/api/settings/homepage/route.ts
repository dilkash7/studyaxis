import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAuth } from '@/lib/auth';

const DEFAULT_HOMEPAGE = {
  badge: "🎓 India's Trusted Education Consultancy",
  showBadge: true,
  heroTitle: 'Find the Right College\nfor Your Future',
  heroSubtitle: 'Expert guidance for MBBS, Engineering & Abroad admissions. Get free counselling today.',
  btn1Text: '🇮🇳 Study in India',
  btn1Link: '/india',
  btn2Text: '🌍 Study Abroad',
  btn2Link: '/abroad',
  heroImage: '',
  logoUrl: '',
  stats: [
    { value: '500+', label: 'Colleges' },
    { value: '10K+', label: 'Students' },
    { value: '15+', label: 'Countries' },
    { value: '98%', label: 'Success Rate' },
  ],
  siteName: 'StudyAxis',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'info@studyaxis.in',
  address: 'Mangalore, Karnataka',
  instagramUrl: '',
  developerName: '',
  developerUrl: '',
};

export async function GET() {
  try {
    await connectDB();
    const s = await Settings.findOne({ key: 'homepage' }).lean() as any;
    return NextResponse.json({ ...DEFAULT_HOMEPAGE, ...(s?.value || {}) });
  } catch {
    return NextResponse.json(DEFAULT_HOMEPAGE);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    await Settings.findOneAndUpdate(
      { key: 'homepage' },
      { key: 'homepage', value: body, label: 'Homepage Settings' },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}