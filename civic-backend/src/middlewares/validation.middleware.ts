import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import AppError from "../errors/AppError";

export interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const targets: (keyof ValidationSchemas)[] = ["params", "query", "body"];

    for (const key of targets) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return next(new AppError(422, "VALIDATION_ERROR", "Validation failed", details));
      }

      // Assign sanitized, typed data back to request
      req[key] = result.data;
    }

    next();
  };
};

export default validate;
