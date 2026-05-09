import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // The strict, normalized canonical name
  rawName: { type: String }, // The original name from user/OCR
  slug: { type: String, unique: true, sparse: true },
  description: { type: String },
  duration: { type: String }, // e.g., "4 Years", "2 Years"
  durationMonths: { type: Number },
  icon: { type: String },
  
  // Hierarchical Course Classification
  mainCategory: { type: String },
  degreeType: { type: String }, // e.g. B.Tech, MBBS, MBA, BCA, Diploma
  specialization: { type: String }, // e.g. Computer Science, AI & ML
  
  // College & Campus Relationship
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  campusName: { type: String },
  
  // Course Level
  courseType: { type: String, default: 'UG' },
  seats: { type: Number },
  eligibility: { type: String },
  entranceExam: { type: String }, // e.g. NEET, JEE, KCET
  minCutoff: { type: Number }, // NEET, CET score
  avgPlacement: { type: Number },
  
  // Display
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
}, { timestamps: true });

// ── Performance Optimization: Database Indexes ──
CourseSchema.index({ collegeId: 1 });
CourseSchema.index({ campusId: 1 });
CourseSchema.index({ mainCategory: 1, degreeType: 1 });
CourseSchema.index({ name: 'text', specialization: 'text' });
CourseSchema.index({ slug: 1 });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);