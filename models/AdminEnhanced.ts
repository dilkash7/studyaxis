// Enhanced Admin model with detailed permission control
// This file shows the enhanced structure

import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  module: { type: String },
  canView: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'college-admin', 'counsellor'],
    default: 'admin' 
  },
  
  // College Assignment (for college-admin)
  assignedCollegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  assignedCollegeName: { type: String },
  
  // Detailed Permissions
  permissions: {
    dashboard: { type: Boolean, default: true },
    colleges: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    fees: { type: Boolean, default: true },
    leads: { type: Boolean, default: true },
    locations: { type: Boolean, default: true },
    chatbot: { type: Boolean, default: false },
    campuses: { type: Boolean, default: false },
    media: { type: Boolean, default: false },
    brochures: { type: Boolean, default: false },
    categories: { type: Boolean, default: false },
    studentRecords: { type: Boolean, default: false }, // Only for superadmin
    admins: { type: Boolean, default: false }, // Only for superadmin
    settings: { type: Boolean, default: false },
  },
  
  // Module-level permission details
  detailedPermissions: [PermissionSchema],
  
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
