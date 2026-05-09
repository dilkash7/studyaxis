import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  head: { type: String },
  headDesignation: { type: String },
  description: { type: String },
  email: { type: String },
  phone: { type: String },
  courseCount: { type: Number, default: 0 },
  facultyCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DepartmentSchema.index({ college: 1 });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
