import env from "../src/config/env";
import { connectDB, disconnectDB } from "../src/infrastructure/database/connection";
import Category from "../src/modules/categories/entities/Category.entity";

const defaultCategories = [
  { name: "Roads & Potholes", description: "Potholes, broken roads, damaged pavements" },
  { name: "Electrical & Lighting", description: "Streetlights, exposed wires, transformer issues" },
  { name: "Sanitation & Waste", description: "Garbage collection, overflowing bins, open dumps" },
  { name: "Water Supply & Drainage", description: "Water pipeline leaks, clogged drains, contaminated water" },
  { name: "Public Parks & Trees", description: "Fallen trees, park maintenance, encroachment" },
  { name: "Traffic & Road Safety", description: "Damaged signals, missing signage, dangerous crossings" },
  { name: "Other", description: "General municipal civic concerns" },
];

export const seedCategories = async () => {
  try {
    console.log("Connecting to database for categories seeding...");
    await connectDB(env.DATABASE_URL);

    for (const cat of defaultCategories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create({ ...cat, slug, isActive: true });
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category exists: ${cat.name}`);
      }
    }

    console.log("Categories seeded successfully.");
    await disconnectDB();
    process.exit(0);
  } catch (error: any) {
    console.error("Categories seed failed:", error.message);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  seedCategories();
}

export default seedCategories;
