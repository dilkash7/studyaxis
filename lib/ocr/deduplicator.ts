/**
 * Duplicate Prevention Engine
 * Prevents B.E CSE, BTech CSE, Computer Science Engineering
 * from becoming 3 different DB entries
 */

import { normalizeCourse } from './normalizer';

/** Similarity score between two strings (0-100) */
function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 85;

  // Word overlap
  const w1 = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const w2 = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const intersection = [...w1].filter(w => w2.has(w)).length;
  const union = new Set([...w1, ...w2]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
}

/** Canonical key for a course (used for exact dedup) */
function canonicalKey(name: string): string {
  return normalizeCourse(name)
    .toLowerCase()
    .replace(/[^a-z0-9&]/g, '')
    .replace(/and/g, '&')
    .replace(/engineering/g, 'engg')
    .replace(/computer/g, 'comp')
    .replace(/science/g, 'sci')
    .replace(/technology/g, 'tech')
    .replace(/information/g, 'info')
    .replace(/artificial/g, 'art')
    .replace(/intelligence/g, 'int')
    .replace(/machine/g, 'mach')
    .replace(/learning/g, 'learn');
}

export interface DedupResult {
  unique: { name: string; key: string; mergedFrom: string[] }[];
  duplicatesRemoved: number;
  mergeLog: string[];
}

/**
 * Deduplicate a list of course names
 * Returns unique courses with merge history
 */
export function deduplicateCourses(courseNames: string[]): DedupResult {
  const groups: Map<string, { canonical: string; variants: string[] }> = new Map();
  const mergeLog: string[] = [];

  for (const raw of courseNames) {
    const normalized = normalizeCourse(raw);
    const key = canonicalKey(normalized);

    if (groups.has(key)) {
      const group = groups.get(key)!;
      if (!group.variants.includes(raw)) {
        group.variants.push(raw);
        mergeLog.push(`Merged "${raw}" → "${group.canonical}" (same canonical key)`);
      }
    } else {
      // Check fuzzy similarity against existing groups
      let merged = false;
      for (const [existingKey, group] of groups) {
        if (similarity(normalized, group.canonical) >= 80) {
          group.variants.push(raw);
          mergeLog.push(`Merged "${raw}" → "${group.canonical}" (${similarity(normalized, group.canonical)}% similar)`);
          merged = true;
          break;
        }
      }
      if (!merged) {
        groups.set(key, { canonical: normalized, variants: [raw] });
      }
    }
  }

  const unique = Array.from(groups.entries()).map(([key, group]) => ({
    name: group.canonical,
    key,
    mergedFrom: group.variants,
  }));

  return {
    unique,
    duplicatesRemoved: courseNames.length - unique.length,
    mergeLog,
  };
}

/**
 * Check if a course already exists in the database (by name similarity)
 */
export function findExistingMatch(
  newName: string,
  existingCourses: { _id: string; name: string }[],
  threshold = 75
): { match: { _id: string; name: string } | null; score: number } {
  const normalizedNew = normalizeCourse(newName);
  let bestMatch: { _id: string; name: string } | null = null;
  let bestScore = 0;

  for (const existing of existingCourses) {
    const score = similarity(normalizedNew, normalizeCourse(existing.name));
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = existing;
    }
  }

  return { match: bestMatch, score: bestScore };
}
