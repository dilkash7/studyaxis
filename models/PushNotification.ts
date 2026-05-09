import mongoose from 'mongoose';

const PushNotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['Announcement', 'Reminder', 'Promotion', 'Update', 'Alert'], default: 'Announcement' },
  targetAudience: { type: String, enum: ['All', 'Students', 'Leads', 'Admitted', 'Custom'], default: 'All' },
  link: { type: String },
  image: { type: String },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Sent', 'Failed'], default: 'Draft' },
  sentCount: { type: Number, default: 0 },
  createdBy: { type: String },
}, { timestamps: true });

export default mongoose.models.PushNotification || mongoose.model('PushNotification', PushNotificationSchema);
