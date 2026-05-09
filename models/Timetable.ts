import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  title: { type: String, required: true },
  type: { type: String, enum: ['Academic Calendar', 'Exam Schedule', 'Class Timetable', 'Holiday List', 'Semester Plan'], default: 'Academic Calendar' },
  department: { type: String },
  course: { type: String },
  academicYear: { type: String },
  semester: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  entries: [{
    date: { type: Date },
    day: { type: String },
    time: { type: String },
    subject: { type: String },
    description: { type: String },
    venue: { type: String },
    faculty: { type: String },
  }],
  fileUrl: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

TimetableSchema.index({ college: 1, type: 1 });

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
