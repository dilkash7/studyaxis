import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['Seminar', 'Workshop', 'Webinar', 'Conference', 'Fest', 'Open Day', 'Orientation', 'Exam', 'Holiday', 'Other'],
    default: 'Seminar',
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String },
  venue: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  image: { type: String },
  registrationLink: { type: String },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
}, { timestamps: true });

EventSchema.index({ date: -1 });
EventSchema.index({ college: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
