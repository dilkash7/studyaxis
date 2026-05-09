/**
 * Excel/CSV Parser — Structured data import
 * HIGHEST ACCURACY — direct column mapping, no OCR needed
 */

import * as XLSX from 'xlsx';
import { normalizeCourse, normalizeFee } from './normalizer';
import { fullClassify } from '../courseClassifier';

export interface ExcelRow {
  college?: string;
  course?: string;
  stream?: string;
  specialization?: string;
  fee?: string;
  feeAmount?: number;
  duration?: string;
  ugPg?: string;
  eligibility?: string;
  seats?: string;
  [key: string]: any;
}

export interface ExcelParseResult {
  headers: string[];
  rows: ExcelRow[];
  mappedColumns: Record<string, string>;
  totalRows: number;
  sheetName: string;
}

/** Column name aliases for auto-mapping */
const COLUMN_MAP: Record<string, string[]> = {
  college: ['college', 'college name', 'institution', 'university', 'institute', 'college/university'],
  course: ['course', 'course name', 'program', 'programme', 'degree', 'course/program'],
  stream: ['stream', 'branch', 'department', 'faculty', 'discipline'],
  specialization: ['specialization', 'specialisation', 'spec', 'major', 'concentration'],
  fee: ['fee', 'fees', 'total fee', 'annual fee', 'tuition', 'tuition fee', 'amount', 'cost', 'fee (inr)', 'fee(rs)'],
  duration: ['duration', 'years', 'period', 'course duration', 'tenure'],
  ugPg: ['ug/pg', 'ug pg', 'type', 'level', 'course type', 'degree type'],
  eligibility: ['eligibility', 'qualification', 'criteria', 'requirement', 'minimum qualification'],
  seats: ['seats', 'intake', 'capacity', 'total seats', 'no of seats'],
};

/** Auto-map Excel headers to standard column names */
function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    for (const [stdCol, aliases] of Object.entries(COLUMN_MAP)) {
      if (aliases.some(a => lower === a || lower.includes(a))) {
        mapping[header] = stdCol;
        break;
      }
    }
  }
  return mapping;
}

/** Parse Excel/CSV buffer into structured rows */
export function parseExcel(buffer: Buffer, sheetIndex = 0): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) throw new Error('No worksheet found in the file');

  // Convert to JSON with headers
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  if (rawData.length === 0) throw new Error('Empty spreadsheet');

  const headers = Object.keys(rawData[0]);
  const mappedColumns = autoMapColumns(headers);

  // Process rows
  const rows: ExcelRow[] = rawData.map(raw => {
    const row: ExcelRow = {};

    for (const [originalCol, value] of Object.entries(raw)) {
      const mappedCol = mappedColumns[originalCol];
      if (mappedCol) {
        row[mappedCol] = String(value).trim();
      }
    }

    // Normalize course name if present
    if (row.course) {
      row.course = normalizeCourse(row.course);
    }

    // Normalize fee
    if (row.fee) {
      const normalized = normalizeFee(row.fee);
      row.feeAmount = normalized.amount;
      row.fee = normalized.display;
    }

    return row;
  }).filter(row => row.course || row.college); // Skip empty rows

  return {
    headers,
    rows,
    mappedColumns,
    totalRows: rows.length,
    sheetName,
  };
}

/** Convert parsed Excel data to course import format */
export function excelToCourseImport(result: ExcelParseResult): any[] {
  return result.rows.map(row => {
    const classification = row.course ? fullClassify(row.course) : null;
    return {
      name: row.course || '',
      collegeName: row.college || '',
      stream: row.stream || classification?.mainCategory || '',
      specialization: row.specialization || classification?.specialization || '',
      duration: row.duration || classification?.duration || '',
      courseType: row.ugPg || classification?.courseType || '',
      degreeType: classification?.degreeType || '',
      fee: row.fee || '',
      feeAmount: row.feeAmount || 0,
      eligibility: row.eligibility || '',
      seats: row.seats || '',
      source: 'Excel Import',
      confidence: 95, // Excel is highest accuracy
    };
  });
}

/** Detect if buffer is an Excel file */
export function isExcel(buffer: Buffer): boolean {
  // XLSX magic bytes: PK (ZIP format)
  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B) return true;
  // XLS magic bytes: D0 CF 11 E0
  if (buffer.length >= 4 && buffer[0] === 0xD0 && buffer[1] === 0xCF) return true;
  return false;
}

/** Detect if content looks like CSV */
export function isCSV(buffer: Buffer): boolean {
  const sample = buffer.slice(0, 500).toString('utf-8');
  const commaCount = (sample.match(/,/g) || []).length;
  const lineCount = (sample.match(/\n/g) || []).length;
  return commaCount > lineCount && lineCount >= 1;
}
