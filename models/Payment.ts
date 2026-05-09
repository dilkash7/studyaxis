import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  student: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: { type: String },
  course: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['Application Fee', 'Admission Fee', 'Tuition Fee', 'Hostel Fee', 'Exam Fee', 'Other'], default: 'Application Fee' },
  method: { type: String, enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'DD', 'Online'], default: 'Online' },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'], default: 'Pending' },
  transactionId: { type: String },
  receiptNumber: { type: String, unique: true },
  paidAt: { type: Date },
  notes: { type: String },
  recordedBy: { type: String },
}, { timestamps: true });

PaymentSchema.index({ phone: 1, status: 1 });
PaymentSchema.index({ receiptNumber: 1 });

PaymentSchema.pre('save', function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
