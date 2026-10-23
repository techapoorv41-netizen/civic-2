process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-min-32-chars-length-safe";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-min-32-chars-length-safe";
process.env.AI_MODE = "mock";
process.env.STORAGE_DRIVER = "local";
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/civicsense_test";
