import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  college: { type: String },
  courseName: { type: String },
  year: { type: String },
  photo: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
