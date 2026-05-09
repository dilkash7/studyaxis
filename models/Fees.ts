import mongoose from 'mongoose';

const YearFeeSchema = new mongoose.Schema({
  label: { type: String }, // e.g. "Year 1" or "Semester 1"
  amount: { type: String },
});

// Source tracking
const FeeSourceSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['official', 'admin', 'student', 'third-party'],
    default: 'admin',
  },
  sourceUrl: { type: String },
  uploadedBy: { type: String },
  verified: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

const FeesSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  campusName: { type: String },
  
  // Category-wise fees
  feeCategory: {
    type: String,
    enum: ['Karnataka', 'Non-Karnataka', 'Merit', 'Management', 'NRI', 'Scholarship', 'Hostel', 'Transport', 'Exam Fee', 'Miscellaneous', 'General'],
    default: 'General',
  },
  admissionCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionCategory' },
  admissionCategoryName: { type: String },
  categoryShortCode: { type: String },
  
  // Core fee fields
  bookingAmount: { type: String },
  yearWiseFees: [YearFeeSchema],
  totalFee: { type: String },
  
  // ── Additional Fee Components (NEW) ──
  applicationFee: { type: String },
  developmentFee: { type: String },
  libraryFee: { type: String },
  sportsComplexFee: { type: String },
  computerLabFee: { type: String },
  hostelFee: { type: String },
  transportFee: { type: String },
  examFee: { type: String },
  uniformFee: { type: String },
  cautionDeposit: { type: String },
  
  // ── Scholarship (NEW) ──
  scholarshipAvailable: { type: Boolean, default: false },
  scholarshipPercentage: { type: Number }, // e.g. 25 means 25%
  scholarshipDetails: { type: String },
  scholarshipEligibility: { type: String },
  
  // ── Loan ──
  loanAvailable: { type: Boolean, default: false },
  loanDetails: { type: String },
  
  eligibility: { type: String },
  minCutoff: { type: Number },
  
  // ── Media attachments (NEW) ──
  feeStructureImage: { type: String }, // URL for fee poster image
  feeStructurePdf: { type: String }, // URL for fee PDF
  
  // ── Source tracking (NEW) ──
  source: FeeSourceSchema,
  
  extraInfo: { type: String },
  remarks: { type: String },
  
  active: { type: Boolean, default: true },
}, { timestamps: true });

// ── Performance Optimization: Database Indexes ──
FeesSchema.index({ collegeId: 1 });
FeesSchema.index({ courseId: 1 });
FeesSchema.index({ 'source.verified': 1 });

export default mongoose.models.Fees || mongoose.model('Fees', FeesSchema);