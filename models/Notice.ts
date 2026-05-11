import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Admission', 'Exam', 'Result', 'Event', 'Holiday', 'Urgent'],
    default: 'General',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  pinned: { type: Boolean, default: false },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  createdBy: { type: String },
  targetEmails: [{ type: String }],
}, { timestamps: true });

NoticeSchema.index({ isActive: 1, publishDate: -1 });
NoticeSchema.index({ category: 1 });

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
