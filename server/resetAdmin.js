require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL || 'admin@aiesec.my';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hashed = await bcrypt.hash(password, 12);

  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hashed, name: 'AIESEC Super Admin', role: 'superAdmin', lcName: 'AIESEC Malaysia' },
    { upsert: true, new: true }
  );

  console.log(`✅ Admin upserted: ${admin.email} (role: ${admin.role})`);
  console.log(`   Login with: ${email} / ${password}`);
  await mongoose.disconnect();
}

reset().catch(err => { console.error(err); process.exit(1); });
