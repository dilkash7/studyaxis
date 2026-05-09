import mongoose from 'mongoose';

const HostelSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  name: { type: String, required: true },
  type: { type: String, enum: ['Boys', 'Girls', 'Co-Ed'], required: true },
  totalRooms: { type: Number, default: 0 },
  availableRooms: { type: Number, default: 0 },
  roomTypes: [{
    type: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory'] },
    fee: { type: Number },
    feeDisplay: { type: String },
    count: { type: Number },
    available: { type: Number },
  }],
  facilities: [{ type: String }],
  warden: { type: String },
  wardenPhone: { type: String },
  address: { type: String },
  messAvailable: { type: Boolean, default: true },
  messFee: { type: String },
  wifiAvailable: { type: Boolean, default: false },
  acAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

HostelSchema.index({ college: 1 });

export default mongoose.models.Hostel || mongoose.model('Hostel', HostelSchema);
