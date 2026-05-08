import { Document } from 'mongoose';

export interface Campus extends Document {
  collegeId: string;
  collegeName: string;
  name: string;
  location: string;
  city: string;
  state: string;
  country: string;
  address: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  email?: string;
  description?: string;
  established?: string;
  infrastructure?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionCategory extends Document {
  collegeId: string;
  collegeName: string;
  name: string;
  description?: string;
  shortCode: string;
  eligibilityNotes?: string;
  cutoffPercentage?: number;
  cutoffScore?: string;
  applicableFor: string;
  remarks?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollegeMedia extends Document {
  collegeId: string;
  collegeName: string;
  campusId?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  cloudinaryPublicId: string;
  mediaType: 'campus' | 'infrastructure' | 'lab' | 'classroom' | 'library' | 'sports' | 'hostel' | 'cafeteria' | 'auditorium' | 'other';
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollegeBrochure extends Document {
  collegeId: string;
  collegeName: string;
  campusId?: string;
  title: string;
  description?: string;
  documentType: 'fee-structure' | 'admission-brochure' | 'eligibility-brochure' | 'scholarship-brochure' | 'prospectus' | 'academic-calendar' | 'placement-statistics' | 'other';
  fileUrl: string;
  cloudinaryPublicId: string;
  fileName?: string;
  fileSize?: number;
  downloadCount: number;
  viewCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDocument {
  _id?: string;
  documentType: 'marks-card' | 'certificate' | 'id-proof' | 'admission-letter' | 'medical-report' | 'other';
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId?: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface StudentRecord extends Document {
  collegeId: string;
  collegeName: string;
  campusId: string;
  campusName: string;
  courseId: string;
  courseName: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  admissionYear: number;
  admissionDate?: Date;
  admissionNumber: string;
  admissionCategory?: string;
  admissionCategoryName?: string;
  enrollmentNumber?: string;
  rollNumber?: string;
  section?: string;
  semester?: number;
  status: 'Active' | 'Graduated' | 'Dropped-Out' | 'On-Leave' | 'Suspended';
  graduationYear?: number;
  graduationDate?: Date;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  documents: StudentDocument[];
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdvancedSearchQuery {
  campus?: string;
  category?: string;
  courseType?: string;
  city?: string;
  budgetMin?: number;
  budgetMax?: number;
  eligibility?: number;
  country?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CloudinaryUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  resource_type: string;
  type: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
}
