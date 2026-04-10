import mongoose from 'mongoose';

const YearFeeSchema = new mongoose.Schema({
  label: { type: String }, // e.g. "Year 1" or "Semester 1"
  amount: { type: String },
});

const FeesSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  bookingAmount: { type: String },
  yearWiseFees: [YearFeeSchema],
  totalFee: { type: String },
  loanAvailable: { type: Boolean, default: false },
  eligibility: { type: String },
  extraInfo: { type: String },
}, { timestamps: true });

export default mongoose.models.Fees || mongoose.model('Fees', FeesSchema);