const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

const setupTestDB = () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AI_MODE = "mock";
    process.env.STORAGE_DRIVER = "local";
    process.env.JWT_SECRET = "test-jwt-secret-min-32-chars-length-safe";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-min-32-chars-length-safe";

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = {
  setupTestDB,
};
