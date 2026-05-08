import mongoose from 'mongoose';

const CollegeBrochureSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  title: { type: String, required: true },
  description: { type: String },
  documentType: {
    type: String,
    enum: [
      'admission-brochure', 'placement-brochure', 'hostel-brochure',
      'scholarship-pdf', 'scholarship-brochure', 'fee-structure',
      'eligibility-brochure', 'campus-brochure',
      'prospectus', 'academic-calendar', 'placement-statistics',
      'accreditation-certificate', 'other',
    ],
    required: true,
  },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // ── New fields ──
  expiryDate: { type: Date }, // Brochure validity
  academicYear: { type: String }, // e.g. "2025-26"
  
  // Source tracking
  source: {
    sourceType: {
      type: String,
      enum: ['official', 'admin', 'student', 'third-party'],
      default: 'admin',
    },
    sourceUrl: { type: String },
    uploadedBy: { type: String },
    verified: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.CollegeBrochure || mongoose.model('CollegeBrochure', CollegeBrochureSchema);
