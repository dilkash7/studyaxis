import mongoose from 'mongoose';

const TransportRouteSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String },
  routeName: { type: String, required: true },
  routeNumber: { type: String },
  startPoint: { type: String, required: true },
  endPoint: { type: String },
  via: [{ type: String }],
  vehicleType: { type: String, enum: ['Bus', 'Van', 'Mini-Bus', 'Shuttle'], default: 'Bus' },
  departureTime: { type: String },
  arrivalTime: { type: String },
  fee: { type: Number },
  feeDisplay: { type: String },
  feePeriod: { type: String, enum: ['Monthly', 'Semester', 'Yearly'], default: 'Monthly' },
  seatsAvailable: { type: Number },
  driverName: { type: String },
  driverPhone: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

TransportRouteSchema.index({ college: 1 });

export default mongoose.models.TransportRoute || mongoose.model('TransportRoute', TransportRouteSchema);
