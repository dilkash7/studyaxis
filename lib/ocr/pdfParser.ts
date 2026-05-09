/**
 * PDF Parser — Extracts text from PDF files
 * Uses pdf-parse for text-based PDFs
 * Falls back to OCR for scanned PDFs
 */

// Note: For scanned PDFs, OCR is handled separately via visionOCR

export interface PDFParseResult {
  text: string;
  pages: number;
  isScanned: boolean;
  method: 'text-extraction' | 'ocr';
}

/**
 * Extract text from a PDF buffer
 * First tries text extraction (fast, accurate)
 * Falls back to OCR if PDF is scanned (image-based)
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  // Dynamic import to avoid build issues — pdf-parse v2 changed its export shape
  const mod = await import('pdf-parse');
  const pdfParse = (mod as any).default || mod;

  try {
    const data = await pdfParse(buffer, { max: 50 }); // Max 50 pages

    // If text extraction yields meaningful content, use it directly
    const text = data.text?.trim() || '';
    const pageCount = data.numpages || 1;

    if (text.length > 50) {
      // Good text extraction — not a scanned PDF
      return {
        text,
        pages: pageCount,
        isScanned: false,
        method: 'text-extraction',
      };
    }

    // Very little text → likely a scanned PDF → needs OCR
    // For now, return what we have with a flag
    return {
      text: text || '[Scanned PDF — OCR processing needed. Please upload as image for best results.]',
      pages: pageCount,
      isScanned: true,
      method: 'ocr',
    };
  } catch (err: any) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
}

/**
 * Detect if a buffer is a PDF file
 */
export function isPDF(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
}
