import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Admission', 'Fees', 'Hostel', 'Placement', 'Exam', 'Scholarship', 'Abroad', 'Transport', 'Other'],
    default: 'General',
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

FAQSchema.index({ category: 1, order: 1 });

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
