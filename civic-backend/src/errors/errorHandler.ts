import { Request, Response, NextFunction } from "express";
import { logger } from "../shared/utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let status = err.status || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Something went wrong";
  let details = err.details || undefined;

  // Multer file size exceeded
  if (err.code === "LIMIT_FILE_SIZE") {
    status = 422;
    code = "VALIDATION_ERROR";
    message = "File too large";
  }
  // Mongoose CastError (e.g. invalid MongoDB ObjectId)
  else if (err.name === "CastError") {
    status = 422;
    code = "VALIDATION_ERROR";
    message = "Invalid id";
    details = [{ path: err.path, message: `Invalid ObjectId format: ${err.value}` }];
  }
  // Mongoose ValidationError
  else if (err.name === "ValidationError") {
    status = 422;
    code = "VALIDATION_ERROR";
    message = "Database validation failed";
    details = err.errors
      ? Object.values(err.errors).map((e: any) => ({
          path: e.path,
          message: e.message,
        }))
      : undefined;
  }
  // MongoDB duplicate key error (E11000)
  else if (err.code === 11000) {
    status = 409;
    code = "CONFLICT";
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `Duplicate value entered for ${field}`;
  }
  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    status = 401;
    code = "UNAUTHORIZED";
    message = "Invalid token signature";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    code = "UNAUTHORIZED";
    message = "Token has expired";
  }
  // Generic non-operational unexpected server errors
  else if (!err.isOperational) {
    status = 500;
    code = "INTERNAL_ERROR";
    message = process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  }

  // Log server errors (status 500+) with stack trace, suppress in tests if needed
  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, "Unhandled server error");
  }

  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

export default errorHandler;
