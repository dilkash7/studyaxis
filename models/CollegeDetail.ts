import mongoose from 'mongoose';

// ── Source tracking sub-schema (reusable across models) ──
const ContentSourceSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['official', 'admin', 'student', 'third-party'],
    default: 'admin',
  },
  sourceUrl: { type: String },
  uploadedBy: { type: String }, // Admin name
  uploadedById: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  verified: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

// ── Content Section sub-schema ──
const ContentSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: [
      'admission-process', 'scholarship', 'placement', 'hostel',
      'eligibility', 'documents-required', 'faq', 'about',
      'infrastructure', 'faculty', 'transportation', 'accreditation',
      'custom',
    ],
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String }, // Rich text / HTML
  images: [{ type: String }],
  videos: [{ type: String }], // YouTube URLs or uploaded
  pdfs: [{ type: String }],
  externalLinks: [{
    label: { type: String },
    url: { type: String },
  }],
  source: ContentSourceSchema,
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { _id: true });

// ── FAQ item sub-schema ──
const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  displayOrder: { type: Number, default: 0 },
}, { _id: true });

// ── Main College Detail schema ──
const CollegeDetailSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, unique: true },
  collegeName: { type: String },

  // Structured content sections
  sections: [ContentSectionSchema],

  // Standalone FAQ list
  faqs: [FAQSchema],

  // Global source information
  source: ContentSourceSchema,
}, { timestamps: true });

CollegeDetailSchema.index({ collegeId: 1 });

export default mongoose.models.CollegeDetail || mongoose.model('CollegeDetail', CollegeDetailSchema);
