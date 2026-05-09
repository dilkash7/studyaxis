import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  userName: { type: String, required: true },
  userEmail: { type: String },
  userPhone: { type: String },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  ratings: {
    academics: { type: Number, min: 1, max: 5 },
    placement: { type: Number, min: 1, max: 5 },
    infrastructure: { type: Number, min: 1, max: 5 },
    faculty: { type: Number, min: 1, max: 5 },
    campusLife: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
  },
  title: { type: String },
  content: { type: String, required: true },
  pros: [{ type: String }],
  cons: [{ type: String }],
  courseName: { type: String },
  batch: { type: String },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

ReviewSchema.index({ college: 1, isApproved: 1 });
ReviewSchema.index({ overallRating: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
