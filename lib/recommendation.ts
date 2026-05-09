/**
 * AI College Recommendation Engine
 * Scores colleges based on student preferences and returns ranked results
 */

interface StudentPreference {
  stream?: string;
  course?: string;
  location?: string;
  budget?: number;
  entranceExam?: string;
  entranceScore?: number;
  category?: string;
  preferAbroad?: boolean;
}

interface ScoredCollege {
  college: any;
  score: number;
  reasons: string[];
}

/**
 * Score a college against student preferences (0-100)
 */
function scoreCollege(college: any, pref: StudentPreference, courses: any[], fees: any[]): ScoredCollege {
  let score = 50; // Base
  const reasons: string[] = [];

  // Stream match
  if (pref.stream && college.streams?.length) {
    const streamMatch = college.streams.some((s: string) =>
      s.toLowerCase().includes(pref.stream!.toLowerCase())
    );
    if (streamMatch) { score += 15; reasons.push(`Offers ${pref.stream} stream`); }
    else score -= 10;
  }

  // Course match
  if (pref.course) {
    const collegeCourses = courses.filter(c => String(c.college) === String(college._id));
    const courseMatch = collegeCourses.some(c =>
      c.name?.toLowerCase().includes(pref.course!.toLowerCase())
    );
    if (courseMatch) { score += 20; reasons.push(`Offers ${pref.course}`); }
  }

  // Location match
  if (pref.location) {
    const locMatch = [college.location, college.city, college.state].some(l =>
      l?.toLowerCase().includes(pref.location!.toLowerCase())
    );
    if (locMatch) { score += 10; reasons.push(`Located in ${pref.location}`); }
  }

  // Budget match
  if (pref.budget) {
    const collegeFees = fees.filter(f => String(f.college) === String(college._id));
    const minFee = Math.min(...collegeFees.map(f => f.amount || Infinity));
    if (minFee <= pref.budget) { score += 10; reasons.push(`Within budget`); }
    else if (minFee <= pref.budget * 1.2) { score += 5; reasons.push(`Slightly above budget`); }
    else score -= 5;
  }

  // Abroad preference
  if (pref.preferAbroad && college.type === 'Abroad') {
    score += 10; reasons.push('International university');
  } else if (!pref.preferAbroad && college.type !== 'Abroad') {
    score += 5;
  }

  // Quality signals
  if (college.isNAAC) { score += 5; reasons.push('NAAC accredited'); }
  if (college.rating >= 4) { score += 5; reasons.push(`Rating: ${college.rating}/5`); }
  if (college.isFeatured) { score += 3; }

  return { college, score: Math.min(100, Math.max(0, score)), reasons };
}

/**
 * Get college recommendations based on student preferences
 */
export function getRecommendations(
  colleges: any[],
  courses: any[],
  fees: any[],
  preferences: StudentPreference,
  limit: number = 10
): ScoredCollege[] {
  return colleges
    .map(c => scoreCollege(c, preferences, courses, fees))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
