/**
 * Confidence Scoring Engine
 * Every OCR-extracted field gets a confidence score
 * Low confidence (<70%) requires admin review
 */

export interface FieldConfidence {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
  reason?: string;
}

export interface ScanConfidence {
  overall: number;
  fields: FieldConfidence[];
  reviewRequired: boolean;
  summary: string;
}

const REVIEW_THRESHOLD = 70;

/** Score a single field based on OCR word confidence + rule checks */
export function scoreField(
  field: string,
  value: string,
  ocrWordConfidence?: number,
  validationPassed?: boolean
): FieldConfidence {
  let confidence = ocrWordConfidence ?? 50;

  // Boost if value passes validation
  if (validationPassed) confidence = Math.min(confidence + 15, 100);

  // Penalize short/suspicious values
  if (!value || value.trim().length < 2) confidence = 10;
  if (/^[0-9]+$/.test(value) && field !== 'fee') confidence -= 20;
  if (/[^\w\s.,&\-₹\/()]/g.test(value)) confidence -= 10; // unusual chars

  // Boost well-known patterns
  if (field === 'course' && /\b(BTech|MBBS|MBA|BDS|BSc|BCom|BCA)\b/i.test(value)) confidence += 20;
  if (field === 'fee' && /₹[\d,]+/.test(value)) confidence += 15;
  if (field === 'email' && /@/.test(value)) confidence += 20;
  if (field === 'phone' && /\d{10}/.test(value)) confidence += 20;

  confidence = Math.max(0, Math.min(100, Math.round(confidence)));
  const needsReview = confidence < REVIEW_THRESHOLD;

  let reason: string | undefined;
  if (needsReview) {
    if (confidence < 30) reason = 'Very low OCR confidence — likely misread';
    else if (confidence < 50) reason = 'Low confidence — verify manually';
    else reason = 'Below review threshold — please confirm';
  }

  return { field, value, confidence, needsReview, reason };
}

/** Score an entire OCR scan result */
export function scoreScan(fields: FieldConfidence[]): ScanConfidence {
  if (fields.length === 0) {
    return { overall: 0, fields: [], reviewRequired: true, summary: 'No data extracted' };
  }

  const overall = Math.round(fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length);
  const reviewRequired = fields.some(f => f.needsReview);
  const lowCount = fields.filter(f => f.needsReview).length;

  let summary: string;
  if (overall >= 85) summary = 'High confidence — ready to save';
  else if (overall >= 70) summary = `Good confidence — ${lowCount} field(s) need review`;
  else if (overall >= 50) summary = `Medium confidence — ${lowCount} field(s) need admin review`;
  else summary = `Low confidence — most fields need manual verification`;

  return { overall, fields, reviewRequired, summary };
}
