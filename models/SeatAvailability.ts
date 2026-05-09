import mongoose from 'mongoose';

const SeatAvailabilitySchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  course: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  filledSeats: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Management', 'NRI', 'All'], default: 'All' },
  academicYear: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['Available', 'Limited', 'Full', 'Waitlist'], default: 'Available' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

SeatAvailabilitySchema.index({ college: 1, course: 1 });

export default mongoose.models.SeatAvailability || mongoose.model('SeatAvailability', SeatAvailabilitySchema);
