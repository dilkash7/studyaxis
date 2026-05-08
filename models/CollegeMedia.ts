import mongoose from 'mongoose';

const CollegeMediaSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  title: { type: String, required: true },
  description: { type: String },
  caption: { type: String },
  mediaUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  mediaType: {
    type: String,
    enum: [
      'campus', 'infrastructure', 'lab', 'classroom', 'library',
      'sports', 'hostel', 'cafeteria', 'auditorium',
      'events', 'placements', 'hospital', 'certificates',
      'accreditation', 'video', 'reel', 'other',
    ],
    required: true,
  },
  // ── New: file type detection ──
  fileType: {
    type: String,
    enum: ['image', 'video', 'document'],
    default: 'image',
  },
  
  // Source tracking
  source: {
    sourceType: {
      type: String,
      enum: ['official', 'admin', 'student', 'third-party'],
      default: 'admin',
    },
    uploadedBy: { type: String },
    verified: { type: Boolean, default: false },
  },
  
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.CollegeMedia || mongoose.model('CollegeMedia', CollegeMediaSchema);
