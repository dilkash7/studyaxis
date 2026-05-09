import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['Inquiry', 'Callback', 'Complaint', 'Feedback', 'Support'], default: 'Inquiry' },
  college: { type: String },
  course: { type: String },
  preferredTime: { type: String },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved', 'Closed'], default: 'New' },
  assignedTo: { type: String },
  responseNotes: { type: String },
  source: { type: String, default: 'Website' },
}, { timestamps: true });

InquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
