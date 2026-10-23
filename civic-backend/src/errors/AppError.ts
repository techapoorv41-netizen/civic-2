export interface ErrorDetail {
  path?: string;
  message: string;
  [key: string]: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[] | any;
  public readonly isOperational: boolean;

  constructor(status: number, code: string, message: string, details?: ErrorDetail[] | any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: any): AppError {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Login required / Unauthorized", details?: any): AppError {
    return new AppError(401, "UNAUTHORIZED", message, details);
  }

  static forbidden(message = "Not allowed to perform this action", details?: any): AppError {
    return new AppError(403, "FORBIDDEN", message, details);
  }

  static notFound(message = "Resource not found", details?: any): AppError {
    return new AppError(404, "NOT_FOUND", message, details);
  }

  static conflict(message = "Resource already exists or conflict occurred", details?: any): AppError {
    return new AppError(409, "CONFLICT", message, details);
  }

  static validation(message = "Validation failed", details?: any): AppError {
    return new AppError(422, "VALIDATION_ERROR", message, details);
  }

  static internal(message = "Something went wrong on the server", details?: any): AppError {
    return new AppError(500, "INTERNAL_ERROR", message, details);
  }

  static unavailable(message = "Service temporarily unavailable", details?: any): AppError {
    return new AppError(503, "AI_UNAVAILABLE", message, details);
  }
}

export default AppError;
