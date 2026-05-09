/**
 * OCR Engine — Tesseract.js (FREE, no API key)
 * Uses createWorker for Next.js compatibility
 */

import { createWorker } from 'tesseract.js';

export interface RawOCRResult {
  text: string;
  confidence: number;
  processingTimeMs: number;
}

/**
 * Ensure the buffer is a valid PNG for Tesseract
 * Uses sharp if available, otherwise passes buffer through
 */
async function ensurePng(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default;
    return await sharp(buffer).png().toBuffer();
  } catch {
    // sharp not installed or conversion failed — return original buffer
    return buffer;
  }
}

/**
 * Extract text from image buffer using Tesseract.js
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<RawOCRResult> {
  const start = Date.now();
  let worker;
  try {
    // Convert to PNG for maximum Tesseract compatibility
    const pngBuffer = await ensurePng(buffer);
    
    worker = await createWorker('eng');
    const { data } = await worker.recognize(pngBuffer);
    await worker.terminate();

    return {
      text: data.text || '',
      confidence: data.confidence || 0,
      processingTimeMs: Date.now() - start,
    };
  } catch (err: any) {
    if (worker) try { await worker.terminate(); } catch {}
    const msg = err?.message || err?.toString() || 'Unknown Tesseract error';
    console.error('Tesseract OCR error:', msg);
    throw new Error(`OCR extraction failed: ${msg}`);
  }
}

/**
 * Extract text from image URL
 */
export async function extractTextFromUrl(imageUrl: string): Promise<RawOCRResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudyAxis/1.0)' },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Failed to download image: HTTP ${response.status}`);
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('pdf')) {
      throw new Error('PDF files are not supported yet. Please upload an image (JPG/PNG/WEBP) of the brochure.');
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 100) throw new Error('Downloaded file is too small. Check the URL.');
    if (arrayBuffer.byteLength > 15 * 1024 * 1024) throw new Error('Image too large (>15MB). Try a smaller image.');

    const buffer = Buffer.from(arrayBuffer);
    return extractTextFromBuffer(buffer);
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Image download timed out (20s). Try uploading the file directly.');
    throw err;
  }
}
