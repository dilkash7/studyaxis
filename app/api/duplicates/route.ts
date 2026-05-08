import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Campus from '@/models/Campus';

// Normalize text for comparison
function normalize(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity score (0-100)
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 85;
  
  // Word overlap
  const wa = new Set(na.split(' '));
  const wb = new Set(nb.split(' '));
  const intersection = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return Math.round((intersection / union) * 100);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { type, name, collegeId } = await req.json();
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const duplicates: any[] = [];

    if (type === 'college') {
      const colleges = await College.find({}).select('name city country').lean();
      for (const c of colleges) {
        const score = similarity(name, c.name);
        if (score >= 70) duplicates.push({ _id: c._id, name: c.name, city: c.city, score });
      }
    } else if (type === 'course') {
      const filter: any = {};
      if (collegeId) filter.collegeId = collegeId;
      const courses = await Course.find(filter).select('name collegeId collegeName degreeType specialization').lean();
      for (const c of courses) {
        const score = similarity(name, c.name);
        if (score >= 70) duplicates.push({ _id: c._id, name: c.name, collegeName: c.collegeName, score });
      }
    } else if (type === 'campus') {
      const filter: any = {};
      if (collegeId) filter.collegeId = collegeId;
      const campuses = await Campus.find(filter).select('name city collegeId').lean();
      for (const c of campuses) {
        const score = similarity(name, c.name);
        if (score >= 70) duplicates.push({ _id: c._id, name: c.name, city: c.city, score });
      }
    }

    // Sort by similarity score descending
    duplicates.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
