// Enhanced College model with SEO and relationships
// This file shows the enhanced structure

import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  type: { type: String, enum: ['india', 'abroad'], required: true },
  
  // Basic Info
  city: { type: String },
  state: { type: String },
  country: { type: String },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  
  fees: { type: String },
  image: { type: String },
  banner: { type: String },
  description: { type: String },
  
  // Relationships
  courses: [String], // Backward compatibility
  campuses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campus' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionCategory' }],
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollegeMedia' }],
  brochures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollegeBrochure' }],
  
  // Details
  established: { type: String },
  rating: { type: Number, default: 4 },
  affiliation: { type: String },
  accreditation: { type: String },
  
  // Display Control
  featured: { type: Boolean, default: false },
  brochureUrl: { type: String },
  prospectusUrl: { type: String },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  ogImage: { type: String },
  
  // Contact
  phoneNumber: { type: String },
  email: { type: String },
  website: { type: String },
  
  // Additional
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.College || mongoose.model('College', CollegeSchema);
