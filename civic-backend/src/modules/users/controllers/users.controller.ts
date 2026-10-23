import { Request, Response } from "express";
import UsersService from "../services/users.service";
import { ok } from "../../../shared/utils/response";

export class UsersController {
  static async getUserById(req: Request, res: Response): Promise<Response> {
    const result = await UsersService.getUserById({
      targetUserId: String(req.params.id),
      requestingUser: req.user!,
    });
    return ok(res, result);
  }

  static async updateMe(req: Request, res: Response): Promise<Response> {
    const result = await UsersService.updateMe({
      userId: req.user!.id,
      data: req.body,
    });
    return ok(res, result);
  }

  static async getUsers(req: Request, res: Response): Promise<Response> {
    const { users, meta } = await UsersService.getUsers(req.query);
    return ok(res, users, meta);
  }
}

export default UsersController;
