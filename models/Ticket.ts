import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['student', 'admin'], required: true },
  senderName: { type: String },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  messages: [MessageSchema],
  lastMessageAt: { type: Date, default: Date.now },
  unreadByAdmin: { type: Boolean, default: true },
  unreadByStudent: { type: Boolean, default: false }
}, { timestamps: true });

TicketSchema.index({ studentId: 1, lastMessageAt: -1 });
TicketSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
