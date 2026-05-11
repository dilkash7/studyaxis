const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/studyaxis').then(async () => {
  const admin = await mongoose.connection.collection('admins').findOne({ email: 'test@studyaxis.com' });
  console.log(admin);
  const isMatch = await bcrypt.compare('test1234', admin.password);
  console.log('Password match:', isMatch);
  process.exit(0);
});
