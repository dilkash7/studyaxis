/**
 * Google Cloud Vision OCR Engine
 * 
 * DRAMATICALLY better than Tesseract for:
 * - Scanned documents
 * - Fee tables with complex layouts
 * - Low-quality WhatsApp forwards
 * - Handwritten text
 * 
 * Uses Vision API TEXT_DETECTION for full OCR
 * Falls back to Tesseract if Vision is unavailable
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface VisionResult {
  text: string;
  confidence: number;
  engine: 'google-vision';
  blocks: { text: string; confidence: number }[];
}

/**
 * Get Google Vision credentials from file or env
 */
function getCredentials(): { email: string; key: string; projectId: string } | null {
  try {
    // Try env variable first
    if (process.env.GOOGLE_VISION_KEY_JSON) {
      const creds = JSON.parse(process.env.GOOGLE_VISION_KEY_JSON);
      return { email: creds.client_email, key: creds.private_key, projectId: creds.project_id };
    }

    // Try file path
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve(process.cwd(), 'google-vision-key.json');
    const raw = readFileSync(keyPath, 'utf-8');
    const creds = JSON.parse(raw);
    return { email: creds.client_email, key: creds.private_key, projectId: creds.project_id };
  } catch {
    return null;
  }
}

/**
 * Generate JWT for Google API auth
 */
async function getAccessToken(email: string, key: string): Promise<string> {
  const crypto = await import('crypto');
  const now = Math.floor(Date.now() / 1000);
  
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  
  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(key, 'base64url');
  const jwt = `${signInput}.${signature}`;
  
  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Failed to get access token');
  return tokenData.access_token;
}

/**
 * Run Google Vision OCR on an image buffer
 */
export async function visionOCR(imageBuffer: Buffer): Promise<VisionResult> {
  const creds = getCredentials();
  if (!creds) throw new Error('Google Vision credentials not found');

  const accessToken = await getAccessToken(creds.email, creds.key);
  const base64Image = imageBuffer.toString('base64');

  const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: { content: base64Image },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 1 },
          { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
        ],
      }],
    }),
  });

  const data = await response.json();
  
  if (data.error) throw new Error(data.error.message || 'Vision API error');
  
  const result = data.responses?.[0];
  if (!result) throw new Error('No response from Vision API');

  // Use DOCUMENT_TEXT_DETECTION for best results (preserves layout)
  const fullText = result.fullTextAnnotation?.text || result.textAnnotations?.[0]?.description || '';
  
  // Extract block-level confidence
  const blocks = result.fullTextAnnotation?.pages?.[0]?.blocks?.map((block: any) => ({
    text: block.paragraphs?.map((p: any) => p.words?.map((w: any) => w.symbols?.map((s: any) => s.text).join('')).join(' ')).join('\n') || '',
    confidence: block.confidence || 0,
  })) || [];

  const avgConfidence = blocks.length > 0 
    ? Math.round(blocks.reduce((s: number, b: any) => s + b.confidence, 0) / blocks.length * 100)
    : 85;

  return {
    text: fullText,
    confidence: avgConfidence,
    engine: 'google-vision',
    blocks,
  };
}

/**
 * Check if Google Vision is available
 */
export function isVisionAvailable(): boolean {
  return getCredentials() !== null;
}
