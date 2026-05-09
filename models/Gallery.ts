import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  title: { type: String, required: true },
  type: { type: String, enum: ['Image', 'Video', 'Virtual Tour', '360°'], default: 'Image' },
  category: {
    type: String,
    enum: ['Campus', 'Classroom', 'Lab', 'Library', 'Hostel', 'Sports', 'Events', 'Infrastructure', 'Placement', 'Other'],
    default: 'Campus',
  },
  url: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String },
  order: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

GallerySchema.index({ college: 1, category: 1 });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
