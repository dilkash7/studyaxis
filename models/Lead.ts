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
    enum: ['New', 'Contacted', 'Interested', 'Paid', 'Admitted'],
    default: 'New',
  },
  notes: String,
  source: { type: String, default: 'Website' },
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export { Lead };
export default Lead;