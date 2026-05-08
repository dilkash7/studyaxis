/**
 * OCR Engine — Tesseract.js (FREE, no API key needed)
 * Handles image text extraction. PDF support via image conversion.
 */

import Tesseract from 'tesseract.js';

export interface RawOCRResult {
  text: string;
  confidence: number;
  words: { text: string; confidence: number }[];
  processingTimeMs: number;
}

/**
 * Extract text from image buffer using Tesseract.js
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<RawOCRResult> {
  const start = Date.now();
  try {
    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: () => {},  // silent
    });

    const words = (result.data.words || []).map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
    }));

    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      words,
      processingTimeMs: Date.now() - start,
    };
  } catch (err: any) {
    console.error('Tesseract OCR error:', err.message);
    throw new Error(`OCR extraction failed: ${err.message}`);
  }
}

/**
 * Extract text from image URL using Tesseract.js
 */
export async function extractTextFromUrl(imageUrl: string): Promise<RawOCRResult> {
  const start = Date.now();
  try {
    // Download image first
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return extractTextFromBuffer(buffer);
  } catch (err: any) {
    console.error('Tesseract URL OCR error:', err.message);
    throw new Error(`OCR extraction failed: ${err.message}`);
  }
}
