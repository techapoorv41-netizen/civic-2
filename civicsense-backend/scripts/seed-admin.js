const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../src/config/env');
const { connectDB } = require('../src/database/connection');
const User = require('../src/modules/users/entities/user.entity');

(async () => {
  const email = (process.env.ADMIN_SEED_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    console.error('.env me ADMIN_SEED_EMAIL aur ADMIN_SEED_PASSWORD daalo');
    process.exit(1);
  }
  await connectDB();
  if (await User.findOne({ email })) {
    console.log('Admin pehle se hai:', email);
  } else {
    await User.create({
      name: 'Admin', email, phone: '9999999999', role: 'admin',
      passwordHash: await bcrypt.hash(password, 10),
    });
    console.log('Admin ban gaya:', email);
  }
  await mongoose.disconnect();
})();