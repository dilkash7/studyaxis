/**
 * Smart Table Detection Engine
 * Detects tabular structure in OCR text using positional + regex analysis
 * Solves: "BPT %1,75,000" → "BPT" | "₹1,75,000"
 */

import { normalizeCourse, normalizeFee } from './normalizer';
import { fullClassify } from '../courseClassifier';

export interface TableRow {
  course: string;
  normalizedCourse: string;
  fee: { amount: number; display: string } | null;
  duration: string;
  classification: ReturnType<typeof fullClassify> | null;
  confidence: number;
  rawLine: string;
  rowIndex: number;
}

export interface TableDetectionResult {
  isTable: boolean;
  rows: TableRow[];
  headerLine: string;
  tableConfidence: number;
}

/** Amount detection patterns — catches Indian fee formats */
const AMOUNT_REGEX = /(?:₹|Rs\.?\s*|INR\s*)?(\d{1,3}(?:[,]\d{2,3})*(?:\.\d{1,2})?)\s*(?:\/[-]|L(?:akh)?s?|K|Cr(?:ore)?|p\.?a\.?)?/gi;

/** Duration detection */
const DURATION_REGEX = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|months?|semesters?)/gi;

/** Degree patterns */
const DEGREE_REGEX = /\b(B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|MBBS|BDS|BAMS|BHMS|MBA|BBA|BCA|MCA|B\.?Com|M\.?Com|B\.?Sc|M\.?Sc|B\.?A\.?|M\.?A\.?|LLB|LLM|B\.?Pharm|D\.?Pharm|M\.?Pharm|Pharm\.?D|B\.?Ed|M\.?Ed|GNM|ANM|BPT|BOT|PGDM|B\.?Des|M\.?Des|BHM|DMLT|Diploma|PhD|Ph\.?D)\b/gi;

/**
 * Detect if text contains a table structure
 * Uses multiple heuristics: consistent delimiters, numeric columns, degree keywords
 */
export function detectTable(text: string): TableDetectionResult {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  const result: TableDetectionResult = { isTable: false, rows: [], headerLine: '', tableConfidence: 0 };

  if (lines.length < 2) return result;

  // Heuristic 1: Tab/pipe separated
  const tabSepLines = lines.filter(l => l.includes('\t') || l.includes('|')).length;
  const hasDelimiters = tabSepLines > lines.length * 0.3;

  // Heuristic 2: Multiple lines with both degree keywords AND amounts
  let courseFeeLines = 0;
  const tableRows: TableRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const degreeMatches = line.match(DEGREE_REGEX);
    const amountMatches = [...line.matchAll(AMOUNT_REGEX)];

    // Filter amounts: must be >= 1000 and not look like a year
    const validAmounts = amountMatches.filter(m => {
      const num = parseFloat(m[1].replace(/,/g, ''));
      return num >= 1000 && !(num >= 1900 && num <= 2100);
    });

    if (degreeMatches && degreeMatches.length > 0) {
      courseFeeLines++;

      // Extract course name: everything before the first amount
      const firstAmountIdx = validAmounts.length > 0 ? line.indexOf(validAmounts[0][0]) : -1;
      let coursePart = firstAmountIdx > 0 ? line.slice(0, firstAmountIdx) : line;

      // Clean course part — remove delimiters, serial numbers
      coursePart = coursePart
        .replace(/^[\d.)\]\s]+/, '')     // Leading serial numbers: "1. " or "1) "
        .replace(/[|;\t]+/g, ' ')        // Delimiters
        .replace(/\s{2,}/g, ' ')         // Multiple spaces
        .trim();

      const normalizedCourse = normalizeCourse(coursePart);
      const classification = fullClassify(normalizedCourse);

      // Extract fee
      let fee: { amount: number; display: string } | null = null;
      if (validAmounts.length > 0) {
        fee = normalizeFee(validAmounts[0][0]);
      }

      // Extract duration
      const durMatch = line.match(DURATION_REGEX);
      const duration = durMatch ? durMatch[0] : classification?.duration || '';

      // Confidence scoring
      let confidence = 40;
      if (classification?.mainCategory) confidence += 15;
      if (classification?.courseType) confidence += 10;
      if (fee && fee.amount > 0) confidence += 20;
      if (duration) confidence += 10;
      if (hasDelimiters) confidence += 5;

      tableRows.push({
        course: coursePart,
        normalizedCourse,
        fee,
        duration,
        classification,
        confidence: Math.min(confidence, 100),
        rawLine: line,
        rowIndex: i,
      });
    }
  }

  // Determine if this is actually a table
  const isTable = courseFeeLines >= 2 || (courseFeeLines >= 1 && hasDelimiters);

  // Find header line (line above first data row with keywords like "Course", "Fee", etc.)
  let headerLine = '';
  if (tableRows.length > 0) {
    const firstDataIdx = tableRows[0].rowIndex;
    if (firstDataIdx > 0) {
      const candidateHeader = lines[firstDataIdx - 1];
      if (/course|program|fee|amount|duration|sl|no\.?/i.test(candidateHeader)) {
        headerLine = candidateHeader;
      }
    }
  }

  const tableConfidence = isTable
    ? Math.round(tableRows.reduce((s, r) => s + r.confidence, 0) / Math.max(tableRows.length, 1))
    : 0;

  return { isTable, rows: tableRows, headerLine, tableConfidence };
}

/**
 * Merge table rows with regular course detection for best results
 */
export function mergeTableWithCourses(tableRows: TableRow[], parsedCourses: any[]): any[] {
  const merged = new Map<string, any>();

  // Table rows take priority (higher accuracy for fee extraction)
  for (const row of tableRows) {
    const key = row.normalizedCourse.toLowerCase().replace(/\s+/g, '');
    merged.set(key, {
      rawName: row.course,
      normalizedName: row.normalizedCourse,
      fee: row.fee,
      duration: row.duration,
      classification: row.classification,
      confidence: row.confidence,
      lineNumber: row.rowIndex + 1,
      source: 'table-detection',
    });
  }

  // Add non-duplicate courses from regular parsing
  for (const course of parsedCourses) {
    const key = (course.normalizedName || course.rawName || '').toLowerCase().replace(/\s+/g, '');
    if (!merged.has(key)) {
      merged.set(key, { ...course, source: 'text-parsing' });
    }
  }

  return Array.from(merged.values());
}
