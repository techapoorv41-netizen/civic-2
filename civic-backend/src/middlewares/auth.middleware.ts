import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import AppError from "../errors/AppError";
import asyncHandler from "../shared/utils/asyncHandler";
import mongoose from "mongoose";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Login required");
    }

    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }

    const userId = payload.sub || payload.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid token subject");
    }

    // Dynamic lookup from User collection (avoiding circular dependency)
    const UserModel = mongoose.models.User;
    if (!UserModel) {
      throw new AppError(500, "INTERNAL_ERROR", "User model not initialized");
    }

    const user = await UserModel.findById(userId).select("role isBlocked").lean() as any;
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "User not found");
    }

    if (user.isBlocked) {
      throw new AppError(403, "USER_BLOCKED", "Account is blocked");
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  }
);

export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      return next();
    }

    try {
      const payload: any = jwt.verify(token, env.JWT_SECRET);
      const userId = payload.sub || payload.id;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const UserModel = mongoose.models.User;
        if (UserModel) {
          const user = await UserModel.findById(userId).select("role isBlocked").lean() as any;
          if (user && !user.isBlocked) {
            req.user = {
              id: user._id.toString(),
              role: user.role,
            };
          }
        }
      }
    } catch {
      // For optional authenticate, silence token errors and continue as guest
    }

    next();
  }
);

export default { authenticate, optionalAuthenticate };
