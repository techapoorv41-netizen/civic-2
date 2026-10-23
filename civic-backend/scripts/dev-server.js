const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const env = require("../src/config/env");
const { connectDB, disconnectDB } = require("../src/database/connection");
const User = require("../src/modules/users/entities/User.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const Category = require("../src/modules/categories/entities/Category.model");
const { ROLES } = require("../src/shared/constants/roles");

const defaultCategories = [
  { name: "Roads & Potholes", description: "Potholes, broken roads, damaged pavements" },
  { name: "Electrical & Lighting", description: "Streetlights, exposed wires, transformer issues" },
  { name: "Sanitation & Waste", description: "Garbage collection, overflowing bins, open dumps" },
  { name: "Water Supply & Drainage", description: "Water pipeline leaks, clogged drains, contaminated water" },
  { name: "Public Parks & Trees", description: "Fallen trees, park maintenance, encroachment" },
  { name: "Traffic & Road Safety", description: "Damaged signals, missing signage, dangerous crossings" },
];

let mongod = null;

const startDevServer = async () => {
  try {
    let mongoUri = env.DATABASE_URL;

    // Try connecting to existing database or spin up MongoMemoryServer
    try {
      console.log(`Checking connection to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log("Connected to local MongoDB service.");
    } catch {
      console.log("No local MongoDB service running. Starting embedded MongoMemoryServer...");
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: "civicsense",
        },
      });
      mongoUri = mongod.getUri();
      console.log(`MongoMemoryServer started at ${mongoUri}`);
      await mongoose.connect(mongoUri);
    }

    // Seed Categories
    console.log("Seeding categories...");
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }

    // Seed Admin
    const adminEmail = (env.ADMIN_SEED_EMAIL || "admin@civicsense.gov").toLowerCase().trim();
    const adminPassword = env.ADMIN_SEED_PASSWORD || "AdminSecurePass123!";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: "System Administrator",
        email: adminEmail,
        passwordHash,
        role: ROLES.ADMIN,
        isBlocked: false,
      });
      console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    }

    // Seed Official
    const officialEmail = "official@civicsense.gov";
    const officialPassword = "OfficialPass123!";
    let official = await User.findOne({ email: officialEmail });
    if (!official) {
      const passwordHash = await bcrypt.hash(officialPassword, 10);
      official = await User.create({
        name: "Zonal Officer Verma",
        email: officialEmail,
        passwordHash,
        role: ROLES.OFFICIAL,
        isBlocked: false,
      });
      await OfficialProfile.create({
        userId: official._id,
        department: "Roads",
        designation: "Chief Area Engineer",
        isVerified: true,
        verifiedBy: admin._id,
        verifiedAt: new Date(),
      });
      console.log(`Verified Official user created: ${officialEmail} / ${officialPassword}`);
    }

    const port = env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`====================================================`);
      console.log(`🚀 CivicSense Unified Backend running on port ${port}`);
      console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${port}/health`);
      console.log(`🔗 API Base:    http://localhost:${port}/api/v1`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log("\nShutting down dev server...");
      server.close();
      await mongoose.disconnect();
      if (mongod) {
        await mongod.stop();
      }
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("Failed to start dev server:", err);
    process.exit(1);
  }
};

startDevServer();
