import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Dean', 'Director', 'Lecturer', 'Guest Faculty'],
    default: 'Assistant Professor',
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  department: { type: String },
  qualification: { type: String },
  specialization: { type: String },
  experience: { type: String },
  email: { type: String },
  phone: { type: String },
  photo: { type: String },
  researchInterests: [{ type: String }],
  publications: { type: Number, default: 0 },
  isHOD: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

FacultySchema.index({ college: 1, department: 1 });

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
