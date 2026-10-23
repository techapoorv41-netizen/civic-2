import bcrypt from "bcryptjs";
import env from "../src/config/env";
import { connectDB, disconnectDB } from "../src/infrastructure/database/connection";
import User from "../src/modules/users/entities/User.entity";
import { ROLES } from "../src/shared/constants/roles";

export const seedAdmin = async () => {
  try {
    const adminEmail = (env.ADMIN_SEED_EMAIL || "admin@civicsense.gov").toLowerCase().trim();
    const adminPassword = env.ADMIN_SEED_PASSWORD || "AdminSecurePass123!";

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD environment variables are required.");
      process.exit(1);
    }

    console.log("Connecting to database for admin seeding...");
    await connectDB(env.DATABASE_URL);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email '${adminEmail}' already exists. Skipping.`);
      await disconnectDB();
      process.exit(0);
    }

    console.log(`Creating initial admin user with email: ${adminEmail}`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: "System Administrator",
      email: adminEmail,
      passwordHash,
      role: ROLES.ADMIN,
      isBlocked: false,
    });

    console.log(`Admin account initialized successfully (User ID: ${admin._id}).`);
    await disconnectDB();
    process.exit(0);
  } catch (error: any) {
    console.error("Failed to seed admin user:", error.message);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
