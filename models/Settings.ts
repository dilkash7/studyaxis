import mongoose from 'mongoose';

const StatSchema = new mongoose.Schema({
  value: String,
  label: String,
});

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  label: String,
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);