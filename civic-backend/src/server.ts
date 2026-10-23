import app from "./app";
import env from "./config/env";
import { connectDB, disconnectDB } from "./infrastructure/database/connection";
import { logger } from "./shared/utils/logger";
import { Server } from "http";

let server: Server;

export const startServer = async (): Promise<Server> => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB(env.DATABASE_URL);

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `CivicSense Backend listening on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
      logger.info(`API Documentation available at http://localhost:${env.PORT}/api/docs`);
    });

    // 3. Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      if (server) {
        server.close(async () => {
          logger.info("HTTP server closed.");
          await disconnectDB();
          logger.info("Process terminated cleanly.");
          process.exit(0);
        });

        // Force shutdown after 10 seconds if graceful close hangs
        setTimeout(() => {
          logger.error("Forceful shutdown after timeout.");
          process.exit(1);
        }, 10000).unref();
      } else {
        await disconnectDB();
        process.exit(0);
      }
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("unhandledRejection", (reason: any) => {
      logger.error({ reason }, "Unhandled Promise Rejection");
    });

    process.on("uncaughtException", (err: Error) => {
      logger.fatal({ err }, "Uncaught Exception. Exiting...");
      process.exit(1);
    });

    return server;
  } catch (error: any) {
    logger.fatal(
      {
        stage: "Server startup",
        error: error.message,
      },
      "Fatal server startup failure. Process exiting with code 1."
    );
    process.exit(1);
  }
};

// Start server if executed directly
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default startServer;
