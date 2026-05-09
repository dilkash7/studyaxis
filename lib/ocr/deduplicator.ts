/**
 * Duplicate Detection Engine v2
 * Normalizes slugs + fuzzy similarity to prevent:
 * "B.E CSE", "BE CSE", "B.E COMPUTER SCIENCE" → same course
 */

/** Generate a normalized slug for dedup comparison */
export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Common abbreviation expansions for deeper matching */
const EXPANSIONS: Record<string, string> = {
  'cse': 'computer science engineering',
  'ece': 'electronics communication engineering',
  'eee': 'electrical electronics engineering',
  'me': 'mechanical engineering',
  'ce': 'civil engineering',
  'it': 'information technology',
  'ai': 'artificial intelligence',
  'ml': 'machine learning',
  'ds': 'data science',
  'btech': 'bachelor of technology',
  'mtech': 'master of technology',
  'be': 'bachelor of engineering',
  'bcom': 'bachelor of commerce',
  'bsc': 'bachelor of science',
  'mba': 'master of business administration',
  'bba': 'bachelor of business administration',
  'bca': 'bachelor of computer applications',
  'mca': 'master of computer applications',
  'mbbs': 'bachelor of medicine bachelor of surgery',
  'bds': 'bachelor of dental surgery',
  'bpharm': 'bachelor of pharmacy',
  'dpharm': 'diploma in pharmacy',
  'llb': 'bachelor of law',
  'bed': 'bachelor of education',
  'pgdm': 'post graduate diploma in management',
};

/** Expand abbreviations for deeper comparison */
function expandSlug(slug: string): string {
  let expanded = slug;
  for (const [abbr, full] of Object.entries(EXPANSIONS)) {
    expanded = expanded.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  }
  return expanded;
}

/**
 * Calculate similarity score between two strings (0-100)
 * Uses Jaccard similarity on word sets
 */
export function similarityScore(a: string, b: string): number {
  const slugA = normalizeSlug(a);
  const slugB = normalizeSlug(b);

  if (slugA === slugB) return 100;

  const expA = expandSlug(slugA);
  const expB = expandSlug(slugB);
  if (expA === expB) return 95;

  const wordsA = new Set(expA.split(' ').filter(Boolean));
  const wordsB = new Set(expB.split(' ').filter(Boolean));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) return 0;
  return Math.round((intersection.size / union.size) * 100);
}

export interface DedupResult {
  unique: any[];
  duplicatesRemoved: number;
  mergeLog: string[];
}

/**
 * Deduplicate a list of courses/items by similarity
 * Threshold: 80% → merge
 */
export function deduplicateCourses(courses: any[], threshold = 80): DedupResult {
  const unique: any[] = [];
  const mergeLog: string[] = [];
  let duplicatesRemoved = 0;

  for (const course of courses) {
    const name = course.normalizedName || course.name || course.normalizedCourse || '';
    let isDup = false;

    for (let i = 0; i < unique.length; i++) {
      const existing = unique[i];
      const existingName = existing.normalizedName || existing.name || existing.normalizedCourse || '';
      const score = similarityScore(name, existingName);

      if (score >= threshold) {
        isDup = true;
        duplicatesRemoved++;
        mergeLog.push(`Merged "${name}" → "${existingName}" (${score}% similar)`);
        const courseConf = course.confidence || 0;
        const existingConf = existing.confidence || 0;
        if (courseConf > existingConf) {
          unique[i] = { ...existing, ...course };
        } else if (course.fee && !existing.fee) {
          unique[i] = { ...existing, fee: course.fee };
        }
        break;
      }
    }

    if (!isDup) unique.push(course);
  }

  return { unique, duplicatesRemoved, mergeLog };
}
