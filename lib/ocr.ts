import path from 'path';
import fs from 'fs';

export interface OCRResult {
  fullText: string;
  courses: string[];
  fees: { label: string; amount: string }[];
  contactInfo: { phones: string[]; emails: string[]; websites: string[] };
  confidence: number;
}

/**
 * Lazy-load Vision client to avoid initialization errors
 */
async function getVisionClient() {
  try {
    const keyPath = path.join(process.cwd(), 'google-vision-key.json');
    if (!fs.existsSync(keyPath)) {
      throw new Error('google-vision-key.json not found in project root');
    }
    const vision = await import('@google-cloud/vision');
    const ImageAnnotatorClient = vision.default?.ImageAnnotatorClient || vision.ImageAnnotatorClient;
    return new ImageAnnotatorClient({ keyFilename: keyPath });
  } catch (err: any) {
    console.error('Vision client init error:', err);
    throw new Error(`Vision client init failed: ${err.message || JSON.stringify(err)}`);
  }
}

/**
 * Extract text from an image URL using Google Cloud Vision OCR
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const client = await getVisionClient();
    const [result] = await client.textDetection({
      image: { source: { imageUri: imageUrl } },
    });
    
    if (result.error) {
      throw new Error(`Vision API error: ${result.error.message} (code: ${result.error.code})`);
    }
    
    const text = result.fullTextAnnotation?.text || '';
    if (!text) {
      // Fallback: check individual text annotations
      const annotations = result.textAnnotations || [];
      if (annotations.length > 0) {
        return annotations[0].description || '';
      }
    }
    return text;
  } catch (err: any) {
    console.error('Vision OCR error details:', err?.code, err?.details, err?.note, err?.statusDetails);
    const note = err?.note || '';
    const msg = err?.details || err?.message || note || 'Unknown Vision API error';
    if (note.includes('not classified as transient') || msg.includes('PERMISSION_DENIED') || msg.includes('has not been used') || err?.code === 7 || err?.code === 403) {
      throw new Error('Google Cloud Vision API is not enabled for your project. Please go to Google Cloud Console → APIs & Services → Enable "Cloud Vision API" for project "studyaxis-ocr"');
    }
    throw new Error(`OCR failed: ${msg}`);
  }
}

/**
 * Extract text from a local file buffer
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const client = await getVisionClient();
    const content = buffer.toString('base64');
    const [result] = await client.textDetection({
      image: { content },
    });
    
    if (result.error) {
      throw new Error(`Vision API error: ${result.error.message} (code: ${result.error.code})`);
    }
    
    const text = result.fullTextAnnotation?.text || '';
    if (!text) {
      const annotations = result.textAnnotations || [];
      if (annotations.length > 0) {
        return annotations[0].description || '';
      }
    }
    return text;
  } catch (err: any) {
    console.error('Vision OCR buffer error:', err?.code, err?.details, err?.note);
    const msg = err.message || err.details || err.note || 'Unknown Vision API error';
    if (msg.includes('not classified as transient') || msg.includes('PERMISSION_DENIED') || err.code === 7 || err.code === 403) {
      throw new Error('Google Cloud Vision API is not enabled. Go to https://console.cloud.google.com/apis/library/vision.googleapis.com and enable it for project "studyaxis-ocr".');
    }
    throw new Error(`OCR failed: ${msg}`);
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

  let confidence = 20;
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
