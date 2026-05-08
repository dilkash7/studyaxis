import mongoose from 'mongoose';

const CampusSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  name: { type: String, required: true }, // Main Campus, Kullu Campus, etc.
  location: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  address: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  phoneNumber: { type: String },
  email: { type: String },
  description: { type: String },
  established: { type: String },
  infrastructure: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Campus || mongoose.model('Campus', CampusSchema);
