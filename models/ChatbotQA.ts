import mongoose from 'mongoose';

const ChatbotQASchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  keywords: [String],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.ChatbotQA || mongoose.model('ChatbotQA', ChatbotQASchema);