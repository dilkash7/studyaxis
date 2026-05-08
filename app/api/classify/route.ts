import { NextRequest, NextResponse } from 'next/server';
import { fullClassify, generateSEO } from '@/lib/courseClassifier';

export async function POST(req: NextRequest) {
  try {
    const { courseName, collegeName } = await req.json();
    if (!courseName) return NextResponse.json({ error: 'courseName required' }, { status: 400 });

    const classification = fullClassify(courseName);
    const seo = collegeName ? generateSEO(collegeName, courseName) : null;

    return NextResponse.json({ ...classification, seo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
