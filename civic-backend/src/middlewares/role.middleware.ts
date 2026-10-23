import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Not allowed to access this resource"));
    }

    next();
  };
};

export default authorize;
