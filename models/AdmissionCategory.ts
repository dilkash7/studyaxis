import mongoose from 'mongoose';

const AdmissionCategorySchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  name: { type: String, required: true }, // Karnataka, Non-Karnataka, Merit, Management, NRI
  description: { type: String },
  shortCode: { type: String }, // KA, NK, Merit, Mgmt, NRI
  eligibilityNotes: { type: String },
  cutoffPercentage: { type: Number },
  cutoffScore: { type: String }, // For NEET, CET, etc.
  applicableFor: { type: String }, // UG, PG, Both
  remarks: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.AdmissionCategory || mongoose.model('AdmissionCategory', AdmissionCategorySchema);
