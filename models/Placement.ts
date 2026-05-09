import mongoose from 'mongoose';

const PlacementSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  year: { type: Number, required: true },
  company: { type: String, required: true },
  companyLogo: { type: String },
  role: { type: String },
  department: { type: String },
  package: { type: String },
  packageLPA: { type: Number },
  studentsPlaced: { type: Number, default: 1 },
  type: {
    type: String,
    enum: ['On-Campus', 'Off-Campus', 'Pool Campus', 'Internship'],
    default: 'On-Campus',
  },
  isHighest: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

PlacementSchema.index({ college: 1, year: -1 });
PlacementSchema.index({ company: 1 });

export default mongoose.models.Placement || mongoose.model('Placement', PlacementSchema);
