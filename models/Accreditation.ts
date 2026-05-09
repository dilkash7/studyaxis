import mongoose from 'mongoose';

const AccreditationSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  type: {
    type: String,
    enum: ['NAAC', 'NBA', 'NIRF', 'QS World', 'THE', 'ABET', 'ISO', 'UGC', 'AICTE', 'MCI/NMC', 'BCI', 'Other'],
    required: true,
  },
  grade: { type: String },
  rank: { type: Number },
  score: { type: String },
  validFrom: { type: Date },
  validUntil: { type: Date },
  certificateUrl: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AccreditationSchema.index({ college: 1 });

export default mongoose.models.Accreditation || mongoose.model('Accreditation', AccreditationSchema);
