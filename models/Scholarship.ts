import mongoose from 'mongoose';

const ScholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String },
  type: {
    type: String,
    enum: ['Merit', 'Need-Based', 'Sports', 'SC/ST', 'OBC', 'Minority', 'Women', 'Disability', 'Government', 'Private', 'International'],
    default: 'Merit',
  },
  eligibility: { type: String },
  amount: { type: String },
  amountValue: { type: Number },
  percentage: { type: String },
  applicationDeadline: { type: Date },
  applicationLink: { type: String },
  description: { type: String },
  requiredDocuments: [{ type: String }],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  applicableStreams: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ScholarshipSchema.index({ type: 1, isActive: 1 });
ScholarshipSchema.index({ college: 1 });

export default mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
