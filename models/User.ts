import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // Hashed
  
  // Profile Information
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  
  // Academic Background
  highestQualification: { type: String },
  percentage: { type: String },
  passingYear: { type: String },
  
  // Interests (For Recommendation Engine)
  interestedCourses: [{ type: String }],
  preferredLocations: [{ type: String }],
  
  // Security & Tracking
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  sessionToken: { type: String }, // For forceful logouts
  
  // Saved Items
  savedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
  
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
