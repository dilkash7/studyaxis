import AdminLog from '@/models/AdminLog';
import { connectDB } from '@/lib/mongodb';

interface LogEntry {
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  action: string;
  module: string;
  description?: string;
  targetId?: string;
  targetName?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(entry: LogEntry) {
  try {
    await connectDB();
    await AdminLog.create(entry);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw — logging should never break the main flow
  }
}
