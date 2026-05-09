import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Student info
  studentName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  fatherName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  // Academic
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  course: { type: String },
  academicYear: { type: String },
  previousQualification: { type: String },
  percentage: { type: String },
  entranceExam: { type: String },
  entranceScore: { type: String },
  // Status tracking
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Documents Pending', 'Interview Scheduled', 'Accepted', 'Rejected', 'Fee Paid', 'Enrolled', 'Cancelled'],
    default: 'Submitted',
  },
  applicationNumber: { type: String, unique: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String },
  reviewNotes: { type: String },
  documents: [{
    name: { type: String },
    url: { type: String },
    verified: { type: Boolean, default: false },
  }],
  source: { type: String, default: 'Website' },
}, { timestamps: true });

ApplicationSchema.index({ status: 1, submittedAt: -1 });
ApplicationSchema.index({ college: 1 });
ApplicationSchema.index({ phone: 1 });

// Auto-generate application number
ApplicationSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    this.applicationNumber = `SA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
