// This file shows the enhanced Course schema structure
// To update existing Course model, replace the content of Course.ts with this

import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String }, // Full description, not truncated
  duration: { type: String }, // e.g., "4 Years", "2 Years"
  durationMonths: { type: Number },
  icon: { type: String },
  
  // College & Campus Relationship
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  campusName: { type: String },
  
  // Course Type
  courseType: {
    type: String,
    enum: ['UG', 'PG', 'Diploma', 'Certificate', 'Other'],
    default: 'UG'
  },
  
  // Course Details
  specialization: { type: String },
  seats: { type: Number },
  eligibility: { type: String },
  minCutoff: { type: Number }, // NEET, CET score
  avgPlacement: { type: Number },
  
  // Metadata
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
