import vision from '@google-cloud/vision';
import path from 'path';

// Initialize Vision client with service account
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(process.cwd(), 'google-vision-key.json'),
});

export interface OCRResult {
  fullText: string;
  courses: string[];
  fees: { label: string; amount: string }[];
  contactInfo: { phones: string[]; emails: string[]; websites: string[] };
  confidence: number;
}

/**
 * Extract text from an image URL using Google Cloud Vision OCR
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const [result] = await client.textDetection(imageUrl);
    const text = result.fullTextAnnotation?.text || '';
    return text;
  } catch (err: any) {
    console.error('Vision OCR error:', err.message);
    throw new Error(`OCR failed: ${err.message}`);
  }
}

/**
 * Extract text from a local file buffer
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const [result] = await client.textDetection({ image: { content: buffer } });
    return result.fullTextAnnotation?.text || '';
  } catch (err: any) {
    console.error('Vision OCR buffer error:', err.message);
    throw new Error(`OCR failed: ${err.message}`);
  }
}

/**
 * Parse extracted OCR text into structured data
 */
export function parseOCRText(rawText: string): OCRResult {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract courses
  const coursePatterns = /\b(B\.?Tech|M\.?Tech|B\.?E|M\.?E|MBBS|BDS|BAMS|BHMS|MBA|BBA|BCA|MCA|B\.?Com|M\.?Com|BSc|MSc|BA |MA |LLB|LLM|B\.?Pharm|D\.?Pharm|M\.?Pharm|Pharm\.?D|B\.?Ed|M\.?Ed|GNM|ANM|BPT|BOT|PGDM|B\.?Des|M\.?Des|BHM|DMLT|Diploma)\b/gi;
  const courseMatches = rawText.match(coursePatterns) || [];
  const courses = [...new Set(courseMatches.map(c => c.trim()))];

  // Extract fees (patterns like ₹1,00,000 or Rs. 50000 or INR 3L)
  const feePattern = /(?:₹|Rs\.?|INR)\s*[\d,\.]+(?:\s*(?:L|Lakh|Lakhs|K|Cr))?/gi;
  const feeMatches = rawText.match(feePattern) || [];
  const fees: { label: string; amount: string }[] = [];
  
  feeMatches.forEach((match, i) => {
    // Try to find context (line containing the fee)
    const line = lines.find(l => l.includes(match));
    fees.push({
      label: line ? line.replace(match, '').trim().slice(0, 50) || `Fee ${i + 1}` : `Fee ${i + 1}`,
      amount: match.trim(),
    });
  });

  // Extract contact info
  const phonePattern = /(?:\+91[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{3}[\s-]\d{3}[\s-]\d{4})/g;
  const emailPattern = /[\w.-]+@[\w.-]+\.\w{2,}/g;
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?[\w.-]+\.\w{2,}(?:\/[\w.-]*)?/gi;

  const phones = [...new Set((rawText.match(phonePattern) || []).map(p => p.trim()))];
  const emails = [...new Set((rawText.match(emailPattern) || []).map(e => e.trim()))];
  const websites = [...new Set(
    (rawText.match(websitePattern) || [])
      .filter(w => !w.includes('@') && w.includes('.'))
      .map(w => w.trim())
  )];

  // Confidence based on how much we extracted
  let confidence = 20; // base
  if (courses.length > 0) confidence += 30;
  if (fees.length > 0) confidence += 25;
  if (phones.length > 0 || emails.length > 0) confidence += 15;
  if (rawText.length > 100) confidence += 10;

  return {
    fullText: rawText,
    courses,
    fees,
    contactInfo: { phones, emails, websites },
    confidence: Math.min(confidence, 100),
  };
}
