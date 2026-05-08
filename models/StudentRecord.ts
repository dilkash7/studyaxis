import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: [
      'aadhaar', 'marks-card', 'cet-rank-card', 'neet-scorecard',
      'transfer-certificate', 'passport', 'visa', 'student-photo',
      'signature', 'birth-certificate', 'caste-certificate',
      'income-certificate', 'migration-certificate',
      'admission-letter', 'medical-report', 'id-proof',
      'certificate', 'other',
    ],
    required: true,
  },
  fileName: { type: String },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  uploadedByName: { type: String },
  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  adminNotes: { type: String },
}, { _id: true });

const StudentRecordSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  campusName: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String },

  // Student Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  // Address
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },

  // Admission Details
  admissionYear: { type: Number, required: true },
  admissionDate: { type: Date },
  admissionNumber: { type: String, unique: true, sparse: true },
  admissionCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionCategory' },
  admissionCategoryName: { type: String },

  // Academic Details
  enrollmentNumber: { type: String, unique: true, sparse: true },
  rollNumber: { type: String },
  section: { type: String },
  semester: { type: Number },

  // Status
  status: {
    type: String,
    enum: ['Active', 'Graduated', 'Dropped-Out', 'On-Leave', 'Suspended'],
    default: 'Active',
  },
  graduationYear: { type: Number },
  graduationDate: { type: Date },

  // Guardian Information
  guardianName: { type: String },
  guardianPhone: { type: String },
  guardianEmail: { type: String },
  guardianRelation: { type: String },

  // Documents (enhanced)
  documents: [DocumentSchema],

  // Additional Notes
  notes: { type: String },

  // System Fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

StudentRecordSchema.index({ admissionNumber: 1, collegeId: 1 }, { unique: true, sparse: true });

export default mongoose.models.StudentRecord || mongoose.model('StudentRecord', StudentRecordSchema);
