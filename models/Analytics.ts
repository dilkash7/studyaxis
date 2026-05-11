import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  eventType: { type: String, required: true }, // 'pageview', 'click', 'scroll', 'form_submit', 'search'
  url: { type: String },
  path: { type: String },
  elementId: { type: String },
  elementText: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // flexible payload
  duration: { type: Number }, // for pageview or session length
  referrer: { type: String },
  userAgent: { type: String },
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
  country: { type: String },
  ipHash: { type: String }, // Hashed IP for privacy
}, { timestamps: true });

// Indexes for performance
EventSchema.index({ eventType: 1, createdAt: -1 });
EventSchema.index({ path: 1, eventType: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', EventSchema);
