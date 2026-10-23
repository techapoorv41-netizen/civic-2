import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables (supports running from root or civic-backend)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z
      .string()
      .default("5000")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive()),
    DATABASE_URL: z.string().default("mongodb://127.0.0.1:27017/civicsense"),
    MONGODB_URI: z.string().optional(),
    JWT_SECRET: z.string().default("change-me-long-random-jwt-secret-min-32-chars"),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    REFRESH_TOKEN_SECRET: z.string().default("change-me-another-long-random-refresh-secret-min-32-chars"),
    REFRESH_TOKEN_EXPIRES_DAYS: z
      .string()
      .default("7")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive()),
    FRONTEND_URL: z.string().default("http://localhost:5173"),
    PUBLIC_URL: z.string().default("http://localhost:5000"),
    STORAGE_DRIVER: z.enum(["local", "cloudinary"]).default("local"),
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
    CLOUDINARY_API_KEY: z.string().optional().default(""),
    CLOUDINARY_API_SECRET: z.string().optional().default(""),
    UPLOAD_MAX_MB: z
      .string()
      .default("5")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive()),
    AI_MODE: z.enum(["mock", "live"]).default("mock"),
    AI_PROVIDER: z.string().default("gemini"),
    AI_API_KEY: z.string().optional().default(""),
    AI_MODEL: z.string().optional().default(""),
    ADMIN_SEED_EMAIL: z.string().email().default("admin@civicsense.gov"),
    ADMIN_SEED_PASSWORD: z.string().min(8).default("AdminSecurePass123!"),
  })
  .superRefine((data, ctx) => {
    // Production validation rules: strictly enforce required secrets and production settings
    if (data.NODE_ENV === "production") {
      const dbUrl = data.DATABASE_URL || data.MONGODB_URI;
      if (!dbUrl || dbUrl.includes("127.0.0.1") || dbUrl.includes("localhost")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["DATABASE_URL"],
          message: "Production requires a live MongoDB Atlas connection string (DATABASE_URL or MONGODB_URI)",
        });
      }

      if (!data.JWT_SECRET || data.JWT_SECRET.includes("change-me") || data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message: "Production requires a secure, non-default JWT_SECRET of at least 32 characters",
        });
      }

      if (
        !data.REFRESH_TOKEN_SECRET ||
        data.REFRESH_TOKEN_SECRET.includes("change-me") ||
        data.REFRESH_TOKEN_SECRET.length < 32
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["REFRESH_TOKEN_SECRET"],
          message: "Production requires a secure, non-default REFRESH_TOKEN_SECRET of at least 32 characters",
        });
      }

      if (!data.FRONTEND_URL || data.FRONTEND_URL.includes("localhost")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["FRONTEND_URL"],
          message: "Production requires an explicit deployed frontend URL (FRONTEND_URL)",
        });
      }

      if (data.STORAGE_DRIVER !== "cloudinary") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["STORAGE_DRIVER"],
          message: "Production must use Cloudinary storage driver (STORAGE_DRIVER=cloudinary)",
        });
      }

      if (!data.CLOUDINARY_CLOUD_NAME || !data.CLOUDINARY_API_KEY || !data.CLOUDINARY_API_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CLOUDINARY_CLOUD_NAME"],
          message: "Production requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET",
        });
      }

      if (data.AI_MODE !== "live") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["AI_MODE"],
          message: "Production must use live AI configuration (AI_MODE=live)",
        });
      }

      if (!data.AI_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["AI_API_KEY"],
          message: "Production live AI mode requires AI_API_KEY",
        });
      }
    }
  });

export type EnvConfig = z.infer<typeof envSchema> & {
  corsOrigins: string[];
};

export const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Environment validation failed:");
    result.error.errors.forEach((err) => {
      console.error(` - [${err.path.join(".")}] ${err.message}`);
    });
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error("Invalid environment configuration: " + JSON.stringify(result.error.format()));
  }

  const raw = result.data;
  const origins = raw.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean);

  return {
    ...raw,
    DATABASE_URL: raw.DATABASE_URL || raw.MONGODB_URI || "mongodb://127.0.0.1:27017/civicsense",
    corsOrigins: origins,
  };
};

export const env = parseEnv();

// Interop support for CommonJS require("../src/config/env")
(env as any).default = env;
(env as any).env = env;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = env;
}

export default env;
