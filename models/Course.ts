import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String },
  description: { type: String },
  icon: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);