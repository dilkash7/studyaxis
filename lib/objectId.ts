import mongoose from 'mongoose';

/**
 * Safely validate and clean ObjectId references
 * Prevents "Cast to ObjectId failed for value ''" errors
 */
export function cleanObjectId(value: any): mongoose.Types.ObjectId | null {
  if (!value) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return null;
}

/**
 * Sanitize an object's ObjectId fields before save
 * Converts empty strings to null for all specified fields
 */
export function sanitizeObjectIds(data: Record<string, any>, fields: string[]): Record<string, any> {
  const cleaned = { ...data };
  for (const field of fields) {
    if (field in cleaned) {
      cleaned[field] = cleanObjectId(cleaned[field]);
    }
  }
  return cleaned;
}

/**
 * Check if a string looks like a MongoDB ObjectId
 */
export function isObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Check if a string looks like a slug (not an ObjectId)
 */
export function isSlug(value: string): boolean {
  return !isObjectId(value) && /^[a-z0-9-]+$/.test(value);
}
