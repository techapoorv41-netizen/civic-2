import { Request, Response } from "express";
import NotificationsService from "../services/notifications.service";
import { ok } from "../../../shared/utils/response";

export class NotificationsController {
  static async getNotifications(req: Request, res: Response): Promise<Response> {
    const { notifications, meta } = await NotificationsService.getNotifications({
      userId: req.user!.id,
      query: req.query,
    });
    return ok(res, notifications, meta);
  }

  static async markAsRead(req: Request, res: Response): Promise<Response> {
    const result = await NotificationsService.markAsRead({
      notificationId: String(req.params.id),
      userId: req.user!.id,
    });
    return ok(res, result);
  }

  static async markAllAsRead(req: Request, res: Response): Promise<Response> {
    const result = await NotificationsService.markAllAsRead(req.user!.id);
    return ok(res, result);
  }
}

export default NotificationsController;
