require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  PUBLIC_URL: z.string().default('http://localhost:5000'),
  UPLOAD_MAX_MB: z.coerce.number().default(5),
  AI_MODE: z.enum(['mock', 'live']).default('mock'),
  AI_PROVIDER: z.enum(['anthropic', 'gemini']).default('anthropic'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = {
  ...parsed.data,
  corsOrigins: parsed.data.FRONTEND_URL.split(',').map((s) => s.trim()),
};

if (env.NODE_ENV === 'production' && env.AI_MODE === 'mock') {
  console.error('AI_MODE=mock production me allowed nahi');
  process.exit(1);
}

module.exports = env;