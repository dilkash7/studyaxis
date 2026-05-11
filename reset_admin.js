const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: '.env.local' });
const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("❌ MONGODB_URI missing in .env.local");
  process.exit(1);
}

mongoose.connect(URI).then(async () => {
  try {
    const hash = await bcrypt.hash('test1234', 10);
    const result = await mongoose.connection.collection('admins').updateOne(
      { email: 'test@studyaxis.com' },
      { $set: { password: hash, active: true, isActive: true, sessionToken: null } }
    );
    console.log('Reset complete. Modified count:', result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
