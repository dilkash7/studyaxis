/**
 * OCR Parser — Extracts structured data from normalized OCR text
 * College detection, fee table detection, multi-course parsing
 */

import { normalizeCourse, normalizeFee, normalizeOCRText } from './normalizer';
import { fullClassify } from '../courseClassifier';

// ===== TYPES =====

export interface ParsedCourse {
  rawName: string;
  normalizedName: string;
  fee?: { amount: number; display: string };
  classification: ReturnType<typeof fullClassify>;
  confidence: number;
  lineNumber?: number;
}

export interface ParsedCollege {
  name: string;
  campus?: string;
  university?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  confidence: number;
}

export interface ParsedFee {
  label: string;
  rawAmount: string;
  normalized: { amount: number; display: string };
  category?: string;
  lineNumber?: number;
}

export interface FullParseResult {
  normalizedText: string;
  college: ParsedCollege | null;
  courses: ParsedCourse[];
  fees: ParsedFee[];
  contactInfo: { phones: string[]; emails: string[]; websites: string[] };
  overallConfidence: number;
  warnings: string[];
}

// ===== 8. COLLEGE DETECTION =====

const COLLEGE_KEYWORDS = [
  'university', 'college', 'institute', 'institution', 'academy',
  'school of', 'faculty of', 'deemed', 'autonomous',
];

const CAMPUS_KEYWORDS = ['campus', 'branch', 'center', 'centre'];

export function detectCollege(text: string): ParsedCollege | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let collegeName = '';
  let campus = '';
  let university = '';
  let confidence = 0;

  // Look for lines containing college keywords (usually in first 10 lines)
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (!collegeName && COLLEGE_KEYWORDS.some(k => lower.includes(k))) {
      collegeName = line.replace(/[^\w\s&.,'-]/g, '').trim();
      confidence += 40;
    }
    if (!campus && CAMPUS_KEYWORDS.some(k => lower.includes(k))) {
      campus = line.trim();
      confidence += 15;
    }
    if (!university && lower.includes('university')) {
      university = line.trim();
      confidence += 10;
    }
  }

  // Extract contact info from full text
  const website = (text.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:edu|ac|org)\.?\w*(?:\/[\w.-]*)?/i) || [''])[0];
  const email = (text.match(/[\w.-]+@[\w.-]+\.(?:edu|ac|com|org|in)\b/i) || [''])[0];
  const phone = (text.match(/(?:\+91[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{4}[\s-]\d{3}[\s-]\d{3})/i) || [''])[0];
  const address = detectAddress(lines);

  if (website) confidence += 10;
  if (email) confidence += 10;
  if (phone) confidence += 5;

  if (!collegeName) return null;

  return {
    name: collegeName,
    campus: campus || undefined,
    university: university || undefined,
    address: address || undefined,
    website: website || undefined,
    email: email || undefined,
    phone: phone || undefined,
    confidence: Math.min(confidence, 100),
  };
}

function detectAddress(lines: string[]): string {
  const addressKeywords = ['road', 'street', 'nagar', 'layout', 'district', 'state', 'pin', 'post', 'taluk'];
  for (const line of lines) {
    if (addressKeywords.some(k => line.toLowerCase().includes(k))) {
      return line.trim();
    }
  }
  return '';
}

// ===== 9. FEE TABLE DETECTION =====

const FEE_CATEGORIES: Record<string, string[]> = {
  'Tuition Fee': ['tuition', 'tution', 'course fee'],
  'Hostel Fee': ['hostel', 'accommodation', 'boarding'],
  'Transport Fee': ['transport', 'bus', 'conveyance'],
  'Exam Fee': ['exam', 'examination'],
  'Admission Fee': ['admission', 'registration', 'booking'],
  'Library Fee': ['library'],
  'Lab Fee': ['lab', 'laboratory', 'practical'],
  'Total Fee': ['total', 'grand total', 'aggregate'],
  'Annual Fee': ['annual', 'yearly', 'per year', 'per annum', 'p.a'],
  'Semester Fee': ['semester', 'per sem'],
};

const FEE_AMOUNT_PATTERN = /(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{1,2})?(?:\s*(?:L|Lakh|Lakhs|K|Cr|Crore|\/-))?/gi;

export function detectFees(text: string): ParsedFee[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fees: ParsedFee[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const amounts = line.match(FEE_AMOUNT_PATTERN) || [];

    for (const rawAmount of amounts) {
      const cleaned = rawAmount.replace(/[^\d.,₹RsINRLakhKCr\/\-\s]/gi, '').trim();
      if (!cleaned || cleaned.length < 3) continue;
      // Skip if it's just a year like 2024
      if (/^\d{4}$/.test(cleaned.replace(/[,\s]/g, ''))) continue;
      // Skip tiny numbers
      const numCheck = parseFloat(cleaned.replace(/[^\d.]/g, ''));
      if (numCheck < 100) continue;

      const key = `${i}-${cleaned}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const normalized = normalizeFee(rawAmount);
      const category = detectFeeCategory(line);
      const label = line.replace(rawAmount, '').replace(/[|:;\-–]/g, ' ').trim().slice(0, 80) || `Fee (line ${i + 1})`;

      fees.push({
        label,
        rawAmount: rawAmount.trim(),
        normalized,
        category,
        lineNumber: i + 1,
      });
    }
  }

  return fees;
}

function detectFeeCategory(line: string): string {
  const lower = line.toLowerCase();
  for (const [category, keywords] of Object.entries(FEE_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'General';
}

// ===== 10. MULTI-COURSE PARSING =====

const DEGREE_PATTERNS = /\b(B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|MBBS|BDS|BAMS|BHMS|MBA|BBA|BCA|MCA|B\.?Com|M\.?Com|B\.?Sc|M\.?Sc|B\.?A\.?|M\.?A\.?|LLB|LLM|B\.?Pharm|D\.?Pharm|M\.?Pharm|Pharm\.?D|B\.?Ed|M\.?Ed|GNM|ANM|BPT|BOT|PGDM|B\.?Des|M\.?Des|BHM|DMLT|Diploma|PhD|Ph\.?D)\b/gi;

export function detectCourses(text: string): ParsedCourse[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const courses: ParsedCourse[] = [];
  const seenNormalized = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const degreeMatches = line.match(DEGREE_PATTERNS);
    if (!degreeMatches) continue;

    for (const match of degreeMatches) {
      // Build full course name from the line context
      let courseName = extractCourseName(line, match);
      const normalized = normalizeCourse(courseName);
      const normalizedKey = normalized.toLowerCase().replace(/\s+/g, '');

      // Dedup
      if (seenNormalized.has(normalizedKey)) continue;
      seenNormalized.add(normalizedKey);

      // Try to find fee on same line
      const feeMatch = line.match(FEE_AMOUNT_PATTERN);
      let fee: { amount: number; display: string } | undefined;
      if (feeMatch) {
        const raw = feeMatch[0];
        const num = parseFloat(raw.replace(/[^\d.]/g, ''));
        if (num >= 1000) {
          fee = normalizeFee(raw);
        }
      }

      // Auto-classify
      const classification = fullClassify(normalized);

      // Calculate confidence
      let confidence = 50;
      if (classification.mainCategory) confidence += 15;
      if (classification.courseType) confidence += 10;
      if (classification.specialization) confidence += 10;
      if (fee) confidence += 15;

      courses.push({
        rawName: courseName,
        normalizedName: normalized,
        fee,
        classification,
        confidence: Math.min(confidence, 100),
        lineNumber: i + 1,
      });
    }
  }

  return courses;
}

/** Extract full course name from a line given the degree match */
function extractCourseName(line: string, degreeMatch: string): string {
  const idx = line.indexOf(degreeMatch);
  if (idx === -1) return degreeMatch;

  // Take the degree + everything after until a fee/number pattern or pipe/dash
  const after = line.slice(idx);
  // Stop at fee amount, pipe, or end of meaningful text
  const cutoff = after.search(/(?:₹|Rs\.?|INR|\d{4,}[,.]|\||—|–|\t{2,})/i);
  const coursePart = cutoff > 0 ? after.slice(0, cutoff) : after;
  return coursePart.replace(/[|:;\t]+/g, ' ').trim();
}

// ===== CONTACT INFO =====

export function detectContactInfo(text: string): { phones: string[]; emails: string[]; websites: string[] } {
  const phonePattern = /(?:\+91[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{4}[\s-]\d{3}[\s-]\d{3}|\d{3}[\s-]\d{3}[\s-]\d{4})/g;
  const emailPattern = /[\w.-]+@[\w.-]+\.\w{2,}/g;
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:edu|ac|com|org|in)(?:\.in)?(?:\/[\w.-]*)?/gi;

  const phones = [...new Set((text.match(phonePattern) || []).map(p => p.trim()))];
  const emails = [...new Set((text.match(emailPattern) || []).map(e => e.trim()))];
  const websites = [...new Set(
    (text.match(websitePattern) || []).filter(w => !w.includes('@')).map(w => w.trim())
  )];

  return { phones, emails, websites };
}

// ===== FULL PARSE PIPELINE =====

export function fullParse(rawOCRText: string): FullParseResult {
  const warnings: string[] = [];

  // Step 1: Normalize
  const normalizedText = normalizeOCRText(rawOCRText);

  // Step 2: Detect college
  const college = detectCollege(normalizedText);
  if (!college) warnings.push('Could not detect college name from text');

  // Step 3: Detect courses
  const courses = detectCourses(normalizedText);
  if (courses.length === 0) warnings.push('No courses detected in text');

  // Step 4: Detect fees
  const fees = detectFees(normalizedText);
  if (fees.length === 0) warnings.push('No fee information detected');

  // Step 5: Contact info
  const contactInfo = detectContactInfo(normalizedText);

  // Low confidence warnings
  const lowConfCourses = courses.filter(c => c.confidence < 70);
  if (lowConfCourses.length > 0) {
    warnings.push(`${lowConfCourses.length} course(s) have low confidence and need admin review`);
  }

  // Overall confidence
  let overall = 0;
  if (college) overall += 25;
  if (courses.length > 0) overall += 30;
  if (fees.length > 0) overall += 25;
  if (contactInfo.phones.length > 0 || contactInfo.emails.length > 0) overall += 10;
  if (normalizedText.length > 200) overall += 10;

  return {
    normalizedText,
    college,
    courses,
    fees,
    contactInfo,
    overallConfidence: Math.min(overall, 100),
    warnings,
  };
}
