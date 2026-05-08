// Enhanced Fees schema to support category-wise structure
// This file shows the enhanced structure for reference

import mongoose from 'mongoose';

const YearFeeSchema = new mongoose.Schema({
  label: { type: String }, // e.g. "Year 1" or "Semester 1"
  amount: { type: String },
});

const FeesSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  campusName: { type: String },
  
  // Category-wise fees
  admissionCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionCategory' },
  admissionCategoryName: { type: String },
  categoryShortCode: { type: String },
  
  bookingAmount: { type: String },
  yearWiseFees: [YearFeeSchema],
  totalFee: { type: String },
  
  // Additional Fee Components
  applicationFee: { type: String },
  developmentFee: { type: String },
  libraryFee: { type: String },
  sportsComplexFee: { type: String },
  computerLabFee: { type: String },
  
  loanAvailable: { type: Boolean, default: false },
  scholarshipAvailable: { type: Boolean, default: false },
  
  eligibility: { type: String },
  minCutoff: { type: Number },
  
  extraInfo: { type: String },
  remarks: { type: String },
  
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Fees || mongoose.model('Fees', FeesSchema);
