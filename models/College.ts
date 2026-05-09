import mongoose from 'mongoose';

/** Generate URL-safe slug from college name + optional city */
function generateSlug(name: string, city?: string): string {
  let slug = name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (city) {
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!slug.includes(citySlug)) {
      slug = `${slug}-${citySlug}`;
    }
  }

  return slug;
}

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  type: { type: String, enum: ['india', 'abroad'], required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  fees: { type: String },
  image: { type: String },
  banner: { type: String },
  description: { type: String },
  courses: [String], // Backward compatibility
  
  // New relationships
  campuses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campus' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AdmissionCategory' }],
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollegeMedia' }],
  brochures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollegeBrochure' }],
  
  established: { type: String },
  affiliation: { type: String },
  accreditation: { type: String },
  rating: { type: Number, default: 4 },
  featured: { type: Boolean, default: false },
  brochureUrl: { type: String },
  prospectusUrl: { type: String },
  
  // Trust badges
  verified: { type: Boolean, default: false },
  lastVerifiedAt: { type: Date },
  
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  ogImage: { type: String },
  
  // Contact
  phoneNumber: { type: String },
  email: { type: String },
  website: { type: String },
  
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate slug on save
CollegeSchema.pre('save', async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = generateSlug(this.name, this.city);
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure uniqueness
    const Model = mongoose.models.College || mongoose.model('College', CollegeSchema);
    while (await Model.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

CollegeSchema.index({ slug: 1 });

export default mongoose.models.College || mongoose.model('College', CollegeSchema);