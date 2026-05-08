export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePincode(pincode: string): boolean {
  return /^[0-9]{6}$/.test(pincode);
}

export function validateAdmissionNumber(admissionNumber: string): boolean {
  return admissionNumber.length >= 5;
}

export function validateEnrollmentNumber(enrollmentNumber: string): boolean {
  return enrollmentNumber.length >= 3;
}

export function validateBudget(budget: number): boolean {
  return budget > 0 && budget <= 100000000;
}

export function validatePercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}

export function validateYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 10;
}

export function validateCampusName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

export function validateCategoryName(name: string): boolean {
  return name.length >= 2 && name.length <= 50;
}

export function validateFileName(fileName: string): boolean {
  return fileName.length > 0 && fileName.length <= 255;
}

export function validateImageUrl(url: string): boolean {
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
  return validateUrl(url) && imageRegex.test(url);
}

export function validatePdfUrl(url: string): boolean {
  return validateUrl(url) && url.toLowerCase().endsWith('.pdf');
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.slice(-10);
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

export function generateAdmissionNumber(collegeId: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ADM${timestamp}${random}`;
}

export function generateEnrollmentNumber(collegeId: string, year: number): string {
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `ENR${year}${random}`;
}
