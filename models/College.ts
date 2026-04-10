import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['india', 'abroad'], required: true },
  city: { type: String },
  country: { type: String },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  fees: { type: String },
  image: { type: String },
  description: { type: String },
  courses: [String],
  established: { type: String },
  rating: { type: Number, default: 4 },
  featured: { type: Boolean, default: false },
  brochureUrl: { type: String },
  slug: { type: String },
}, { timestamps: true });

export default mongoose.models.College || mongoose.model('College', CollegeSchema);