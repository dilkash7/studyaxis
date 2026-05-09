import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  course: String,
  location: String,
  college: String,
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Follow-Up', 'Negotiation', 'Paid', 'Admitted', 'Lost'],
    default: 'New',
  },
  notes: String,
  source: { type: String, default: 'Website' },
  // Counsellor Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  assignedToName: { type: String },
  assignedAt: { type: Date },
  // Follow-up tracking
  lastFollowUp: { type: Date },
  nextFollowUp: { type: Date },
  followUpCount: { type: Number, default: 0 },
  // Extra CRM fields
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  budget: { type: String },
  preferredStream: { type: String },
  entranceScore: { type: String },
  callbackRequested: { type: Boolean, default: false },
  callbackTime: { type: Date },
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export { Lead };
export default Lead;