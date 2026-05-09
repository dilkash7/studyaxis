import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['Welcome', 'Application', 'Payment', 'Callback', 'Inquiry', 'Newsletter', 'Reminder', 'Custom'], default: 'Custom' },
  variables: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);
