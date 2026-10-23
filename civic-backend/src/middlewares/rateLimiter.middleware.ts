import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message,
        },
      });
    },
    // Skip rate limiting during test executions
    skip: () => process.env.NODE_ENV === "test",
  });
};

export const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  300,
  "Too many requests from this IP, please try again after 15 minutes"
);

export const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts, please try again after 15 minutes"
);

export const aiLimiter = createRateLimiter(
  60 * 1000,
  10,
  "AI request limit reached, please wait a minute before trying again"
);

export default { generalLimiter, loginLimiter, aiLimiter };
