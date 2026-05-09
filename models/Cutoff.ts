import mongoose from 'mongoose';

const CutoffSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  course: { type: String, required: true },
  exam: {
    type: String,
    enum: ['NEET', 'JEE Main', 'JEE Advanced', 'GATE', 'CAT', 'MAT', 'CLAT', 'NATA', 'CUET', 'State CET', 'University Exam', 'Other'],
    required: true,
  },
  year: { type: Number, required: true },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD', 'Management', 'NRI'], default: 'General' },
  cutoffRank: { type: Number },
  cutoffScore: { type: Number },
  cutoffPercentile: { type: Number },
  round: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

CutoffSchema.index({ college: 1, exam: 1, year: -1 });

export default mongoose.models.Cutoff || mongoose.model('Cutoff', CutoffSchema);
