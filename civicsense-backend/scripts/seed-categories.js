require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/modules/categories/entities/category.entity');

const NAMES = ['Road', 'Streetlight', 'Garbage', 'Water', 'Drainage', 'Electricity', 'Public Safety', 'Other'];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  await mongoose.connect(process.env.DATABASE_URL);
  for (const name of NAMES) {
    await Category.updateOne(
      { name },
      { $setOnInsert: { name, slug: slugify(name), isActive: true } },
      { upsert: true, collation: { locale: 'en', strength: 2 } }
    );
  }
  console.log('Categories seeded:', NAMES.length);
  await mongoose.disconnect();
})();