export const COURSE_TYPES = ['UG', 'PG', 'Diploma', 'Certificate', 'Other'] as const;

export const ADMISSION_CATEGORIES = [
  'Karnataka',
  'Non-Karnataka',
  'Merit',
  'Management',
  'NRI',
  'Other',
] as const;

export const MEDIA_TYPES = [
  'campus',
  'infrastructure',
  'lab',
  'classroom',
  'library',
  'sports',
  'hostel',
  'cafeteria',
  'auditorium',
  'other',
] as const;

export const BROCHURE_TYPES = [
  'fee-structure',
  'admission-brochure',
  'eligibility-brochure',
  'scholarship-brochure',
  'prospectus',
  'academic-calendar',
  'placement-statistics',
  'other',
] as const;

export const DOCUMENT_TYPES = [
  'marks-card',
  'certificate',
  'id-proof',
  'admission-letter',
  'medical-report',
  'other',
] as const;

export const STUDENT_STATUS = [
  'Active',
  'Graduated',
  'Dropped-Out',
  'On-Leave',
  'Suspended',
] as const;

export const ADMIN_ROLES = [
  'superadmin',
  'admin',
  'college-admin',
  'counsellor',
] as const;

export const DEFAULT_PERMISSIONS = {
  dashboard: true,
  colleges: true,
  courses: true,
  fees: true,
  leads: true,
  locations: true,
  chatbot: false,
  campuses: false,
  media: false,
  brochures: false,
  categories: false,
  studentRecords: false,
  admins: false,
  settings: false,
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const API_ENDPOINTS = {
  CAMPUSES: '/api/campuses',
  CATEGORIES: '/api/categories',
  MEDIA: '/api/media',
  BROCHURES: '/api/brochures',
  STUDENT_RECORDS: '/api/student-records',
  SEARCH_ADVANCED: '/api/search/advanced',
  COLLEGES: '/api/colleges',
  COURSES: '/api/courses',
  FEES: '/api/fees',
} as const;

export const COLLEGE_TYPES = ['india', 'abroad'] as const;

export const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
  'Other',
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];
