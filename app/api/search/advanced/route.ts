import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';
import Campus from '@/models/Campus';
import AdmissionCategory from '@/models/AdmissionCategory';
import { NextRequest, NextResponse } from 'next/server';

interface SearchQuery {
  campus?: string;
  category?: string;
  courseType?: string;
  mainCategory?: string;
  degreeType?: string;
  specialization?: string;
  city?: string;
  state?: string;
  budgetMin?: number;
  budgetMax?: number;
  eligibility?: number;
  country?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const query: SearchQuery = await req.json();
    
    const {
      campus,
      category,
      courseType,
      mainCategory,
      degreeType,
      specialization,
      city,
      state,
      budgetMin,
      budgetMax,
      eligibility,
      country,
      featured = false,
      page = 1,
      limit = 20,
    } = query;
    
    const skip = (page - 1) * limit;
    
    // Build college filter
    const collegeFilter: any = { active: true };
    if (country === 'India') collegeFilter.type = 'india';
    else if (country === 'Abroad') collegeFilter.type = 'abroad';
    if (city) collegeFilter.city = { $regex: city, $options: 'i' };
    if (state) collegeFilter.state = { $regex: state, $options: 'i' };
    if (featured) collegeFilter.featured = true;
    
    // Build course filter
    const courseFilter: any = { active: true };
    if (courseType && courseType !== 'Both') courseFilter.courseType = courseType;
    if (mainCategory) courseFilter.mainCategory = mainCategory;
    if (degreeType) courseFilter.degreeType = { $regex: degreeType, $options: 'i' };
    if (specialization) courseFilter.specialization = { $regex: specialization, $options: 'i' };
    
    // Get matching courses first to find relevant college IDs
    const hasCourseFilter = Object.keys(courseFilter).length > 1; // more than just {active: true}
    
    let relevantCollegeIds: string[] | null = null;
    
    if (hasCourseFilter) {
      const matchingCourses = await Course.find(courseFilter).select('collegeId');
      relevantCollegeIds = [...new Set(matchingCourses.map(c => c.collegeId.toString()))];
      if (relevantCollegeIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
      collegeFilter._id = { $in: relevantCollegeIds };
    }
    
    // Budget filter via fees
    if (budgetMin || budgetMax) {
      const feeFilter: any = { active: true };
      if (budgetMax && budgetMax < 100000000) {
        // Only filter if not "no limit"
        const matchingFees = await Fees.find(feeFilter).select('collegeId totalFee');
        const budgetCollegeIds = matchingFees
          .filter(f => {
            const fee = parseFloat(f.totalFee || '0');
            if (fee === 0) return true; // include colleges without fee data
            return fee >= (budgetMin || 0) && fee <= (budgetMax || Infinity);
          })
          .map(f => f.collegeId.toString());
        
        if (relevantCollegeIds) {
          // Intersect with course-filtered IDs
          const budgetSet = new Set(budgetCollegeIds);
          relevantCollegeIds = relevantCollegeIds.filter(id => budgetSet.has(id));
        } else {
          relevantCollegeIds = budgetCollegeIds;
        }
        
        if (relevantCollegeIds.length === 0) {
          return NextResponse.json({
            success: true, data: [],
            pagination: { page, limit, total: 0, pages: 0 },
          });
        }
        collegeFilter._id = { $in: relevantCollegeIds };
      }
    }
    
    // Fetch colleges
    const total = await College.countDocuments(collegeFilter);
    const colleges = await College.find(collegeFilter)
      .sort({ featured: -1, rating: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Enrich with courses, fees, and match score
    const enrichedColleges = await Promise.all(
      colleges.map(async (college) => {
        const courses = await Course.find({
          collegeId: college._id,
          active: true,
          ...(mainCategory ? { mainCategory } : {}),
        }).select('name courseType mainCategory degreeType specialization duration campusName');
        
        const fees = await Fees.find({
          collegeId: college._id,
          active: true,
        }).select('courseName admissionCategoryName totalFee bookingAmount');
        
        return {
          ...college.toObject(),
          courses,
          fees,
          matchScore: calculateMatchScore(college, courses, fees, query),
        };
      })
    );
    
    // Sort by match score
    enrichedColleges.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      success: true,
      data: enrichedColleges,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculateMatchScore(
  college: any,
  courses: any[],
  fees: any[],
  query: SearchQuery
): number {
  let score = 40; // Base score
  
  // Stream match (+20)
  if (query.mainCategory && courses.some(c => c.mainCategory === query.mainCategory)) {
    score += 20;
  }
  
  // Degree match (+15)
  if (query.degreeType && courses.some(c => 
    c.degreeType?.toLowerCase().includes(query.degreeType!.toLowerCase())
  )) {
    score += 15;
  }
  
  // Specialization match (+10)
  if (query.specialization && courses.some(c =>
    c.specialization?.toLowerCase().includes(query.specialization!.toLowerCase())
  )) {
    score += 10;
  }
  
  // Course type match (+5)
  if (query.courseType && courses.some(c => c.courseType === query.courseType)) {
    score += 5;
  }
  
  // Budget match (+15)
  if (query.budgetMin != null && query.budgetMax != null && fees.length > 0) {
    const avgFee = fees.reduce((acc, f) => acc + parseFloat(f.totalFee || '0'), 0) / fees.length;
    if (avgFee > 0 && avgFee >= query.budgetMin && avgFee <= query.budgetMax) {
      score += 15;
    }
  }
  
  // Location match (+5)
  if (query.city && college.city?.toLowerCase().includes(query.city.toLowerCase())) {
    score += 5;
  }
  
  // Rating bonus (+5)
  if (college.rating && college.rating >= 4) {
    score += 5;
  }
  
  // Featured bonus (+5)
  if (college.featured) {
    score += 5;
  }
  
  return Math.min(score, 100);
}
