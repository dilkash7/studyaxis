import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminName: { type: String },
  adminEmail: { type: String },
  action: {
    type: String,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'upload', 'permission_change', 'export', 'other'],
    required: true,
  },
  module: {
    type: String,
    enum: [
      'auth', 'colleges', 'campuses', 'courses', 'fees', 'categories',
      'media', 'brochures', 'student-records', 'admins', 'leads',
      'chatbot', 'settings', 'locations', 'services', 'other'
    ],
  },
  description: { type: String },
  targetId: { type: String }, // ID of the affected record
  targetName: { type: String }, // Name of the affected record
  metadata: { type: mongoose.Schema.Types.Mixed }, // Extra data (old values, etc.)
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// Index for efficient querying
AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ adminId: 1, createdAt: -1 });
AdminLogSchema.index({ module: 1, action: 1 });

export default mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
