import { Request, Response } from "express";
import AdminService from "../services/admin.service";
import { ok } from "../../../shared/utils/response";

export class AdminController {
  static async blockUser(req: Request, res: Response): Promise<Response> {
    const result = await AdminService.blockUser({
      adminId: req.user!.id,
      targetUserId: String(req.params.id),
      reason: req.body.reason,
    });
    return ok(res, result);
  }

  static async unblockUser(req: Request, res: Response): Promise<Response> {
    const result = await AdminService.unblockUser({
      adminId: req.user!.id,
      targetUserId: String(req.params.id),
    });
    return ok(res, result);
  }

  static async getAuditLogs(req: Request, res: Response): Promise<Response> {
    const { logs, meta } = await AdminService.getAuditLogs(req.query);
    return ok(res, logs, meta);
  }

  static async getStats(_req: Request, res: Response): Promise<Response> {
    const stats = await AdminService.getStats();
    return ok(res, stats);
  }
}

export default AdminController;
