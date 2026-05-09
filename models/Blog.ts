import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  category: {
    type: String,
    enum: ['News', 'Admission', 'Career', 'Education', 'Exam', 'Tips', 'Abroad', 'Scholarship'],
    default: 'News',
  },
  tags: [{ type: String }],
  author: { type: String },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
}, { timestamps: true });

BlogSchema.index({ slug: 1 });
BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ category: 1 });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
