import mongoose from "mongoose";
import env from "../../config/env";
import { databaseConfig } from "../../config/database";
import { logger } from "../../shared/utils/logger";

let isConnecting = false;

/**
 * Safely extracts host, port, protocol, and database target from a MongoDB URI without exposing credentials.
 */
export const sanitizeMongoUri = (uri: string): { protocol: string; host: string; database?: string } => {
  try {
    const isSrv = uri.startsWith("mongodb+srv://");
    const pseudoUrl = uri.replace(/^mongodb(\+srv)?:\/\//, "http://");
    const parsed = new URL(pseudoUrl);
    const database = parsed.pathname ? parsed.pathname.replace(/^\//, "") : undefined;
    return {
      protocol: isSrv ? "mongodb+srv" : "mongodb",
      host: parsed.host || "unknown",
      ...(database ? { database } : {}),
    };
  } catch {
    return { protocol: "mongodb", host: "unknown" };
  }
};

export const connectDB = async (customUri?: string): Promise<typeof mongoose> => {
  const uri = customUri || env.DATABASE_URL;
  const target = sanitizeMongoUri(uri);

  if (mongoose.connection.readyState === 1) {
    logger.info("MongoDB is already connected.");
    return mongoose;
  }

  if (isConnecting) {
    logger.info("MongoDB connection already in progress, awaiting...");
    return mongoose;
  }

  try {
    isConnecting = true;

    // Set up connection event listeners once
    mongoose.connection.on("connected", () => {
      logger.info(
        `MongoDB connection established successfully to [${target.protocol}://${target.host}${target.database ? `/${target.database}` : ""}]`
      );
    });

    mongoose.connection.on("error", (err) => {
      logger.error({ err: err.message }, "MongoDB connection error occurred.");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected.");
    });

    await mongoose.connect(uri, databaseConfig.options);
    return mongoose;
  } catch (error: any) {
    const isLocal = target.host.includes("127.0.0.1") || target.host.includes("localhost");
    const remedy = isLocal
      ? "Ensure your local MongoDB service is installed and running (e.g. run 'net start MongoDB' on Windows, or start mongod), or configure a valid DATABASE_URL in civic-backend/.env."
      : "Verify internet connectivity, ensure your IP address is whitelisted in MongoDB Atlas Network Access, and check credentials in DATABASE_URL.";

    logger.fatal(
      {
        stage: "Database Connection",
        target: `${target.protocol}://${target.host}${target.database ? `/${target.database}` : ""}`,
        error: error.message,
        remedy,
      },
      "MongoDB connection initialization failed."
    );
    throw error;
  } finally {
    isConnecting = false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully.");
  }
};

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export default { connectDB, disconnectDB, isConnected, sanitizeMongoUri };
