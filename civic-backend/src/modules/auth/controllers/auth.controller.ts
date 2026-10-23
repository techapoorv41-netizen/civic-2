import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { ok, created } from "../../../shared/utils/response";

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    const userAgent = req.headers["user-agent"] || undefined;
    const result = await AuthService.register(req.body, userAgent);
    return created(res, result);
  }

  static async login(req: Request, res: Response): Promise<Response> {
    const userAgent = req.headers["user-agent"] || undefined;
    const result = await AuthService.login(req.body, userAgent);
    return ok(res, result);
  }

  static async refresh(req: Request, res: Response): Promise<Response> {
    const userAgent = req.headers["user-agent"] || undefined;
    const result = await AuthService.refresh(req.body, userAgent);
    return ok(res, result);
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    await AuthService.logout(req.body);
    return ok(res, { message: "Logged out successfully" });
  }

  static async getMe(req: Request, res: Response): Promise<Response> {
    const user = await AuthService.getMe(req.user!.id);
    return ok(res, { user });
  }
}

export default AuthController;
