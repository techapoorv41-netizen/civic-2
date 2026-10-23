const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "civicsense",
      },
    });
    console.log("MongoDB instance ready at", mongod.getUri());
  } catch (err) {
    console.error("Failed to start MongoDB instance:", err);
  }
})();
