import mongoose from 'mongoose';

const AlumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  photo: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  course: { type: String },
  batch: { type: String },
  graduationYear: { type: Number },
  currentCompany: { type: String },
  currentRole: { type: String },
  location: { type: String },
  linkedin: { type: String },
  achievements: { type: String },
  testimonial: { type: String },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

AlumniSchema.index({ college: 1, graduationYear: -1 });

export default mongoose.models.Alumni || mongoose.model('Alumni', AlumniSchema);
