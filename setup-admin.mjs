import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const MONGODB_URI = "mongodb://muhammaddilkash7_db_user:studyaxis7@ac-tdnoeul-shard-00-00.wcsu9xz.mongodb.net:27017,ac-tdnoeul-shard-00-01.wcsu9xz.mongodb.net:27017,ac-tdnoeul-shard-00-02.wcsu9xz.mongodb.net:27017/studyaxis?ssl=true&replicaSet=atlas-kkzy41-shard-0&authSource=admin";

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  console.log('Connecting...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB!');

  const existing = await Admin.findOne({ email: 'admin@studyaxis.com' });
  if (existing) {
    console.log('⚠️ Admin already exists!');
    process.exit(0);
  }

  const hashed = await bcrypt.hash('admin123', 10);
  await Admin.create({
    name: 'Super Admin',
    email: 'admin@studyaxis.com',
    password: hashed,
    role: 'superadmin',
  });

  console.log('🎉 Admin created!');
  console.log('📧 Email: admin@studyaxis.com');
  console.log('🔑 Password: admin123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});