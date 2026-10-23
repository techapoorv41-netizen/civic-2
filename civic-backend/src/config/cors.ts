import { CorsOptions } from "cors";
import env from "./env";

export const getCorsOptions = (): CorsOptions => {
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile applications, Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // In development or test, allow localhost origins
      if (env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // In production, strictly match configured FRONTEND_URL origins
      if (env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin '${origin}' is not permitted`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Disposition"],
    maxAge: 86400,
  };
};

export default getCorsOptions;
