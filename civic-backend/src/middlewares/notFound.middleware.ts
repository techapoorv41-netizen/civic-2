import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", `Route '${req.method} ${req.originalUrl}' not found`));
};

export default notFoundMiddleware;
