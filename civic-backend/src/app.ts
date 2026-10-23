import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import getCorsOptions from "./config/cors";
import { httpLogger } from "./shared/utils/logger";
import { isConnected } from "./infrastructure/database/connection";
import { setupSwagger } from "./docs/swagger";
import routes from "./routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app: Express = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (strict exact-origin in production, permissive in dev/mobile)
app.use(cors(getCorsOptions()));

// JSON body parser with 1 MB limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Structured Pino HTTP request logging
app.use(httpLogger);

// Health check endpoint (outside /api/v1 prefix per specification)
app.get("/health", (_req: Request, res: Response) => {
  const dbConnected = isConnected();
  const statusCode = dbConnected ? 200 : 503;

  return res.status(statusCode).json({
    success: dbConnected,
    data: {
      status: dbConnected ? "healthy" : "degraded",
      liveness: "alive",
      readiness: dbConnected ? "ready" : "unready",
      uptime: process.uptime(),
      database: {
        connected: dbConnected,
        state: dbConnected ? "connected" : "disconnected",
      },
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

// Dedicated process liveness probe (reports 200 as long as HTTP process is alive)
app.get("/health/liveness", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "alive",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

// Dedicated dependency readiness probe (reports 200 only when database is connected)
app.get("/health/readiness", (_req: Request, res: Response) => {
  const dbConnected = isConnected();
  const statusCode = dbConnected ? 200 : 503;

  return res.status(statusCode).json({
    success: dbConnected,
    data: {
      status: dbConnected ? "ready" : "unready",
      database: {
        connected: dbConnected,
        state: dbConnected ? "connected" : "disconnected",
      },
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

// Swagger API Documentation mounted at /api/docs
setupSwagger(app);

// Central API Router mounted at /api/v1
app.use("/api/v1", routes);

// 404 Not Found Handler for unhandled routes
app.use(notFoundMiddleware);

// Central Error Handling Middleware
app.use(errorMiddleware);

// Export for both ESM and CJS consumers
(app as any).default = app;
(app as any).app = app;
module.exports = app;
export default app;
