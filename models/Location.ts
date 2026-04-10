import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'country'], required: true },
  image: String,
  flag: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);