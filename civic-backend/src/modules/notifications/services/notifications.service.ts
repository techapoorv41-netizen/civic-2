import NotificationsRepository from "../repositories/notifications.repository";
import AppError from "../../../errors/AppError";
import { toNotificationDTO } from "../mappers/notifications.mapper";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import {
  registerNotificationService,
  NotificationPayload,
} from "../../../shared/contracts/notification";
import { NotificationDTO, PaginatedNotificationsDTO } from "../dtos/notifications.dto";
import User from "../../users/entities/User.entity";
import { ROLES } from "../../../shared/constants/roles";
import { FilterQuery } from "mongoose";

export class NotificationsService {
  static async getNotifications({
    userId,
    query = {},
  }: {
    userId: string;
    query?: any;
  }): Promise<PaginatedNotificationsDTO> {
    const { page, limit, skip } = parsePagination(query);
    const filter: FilterQuery<any> = { userId };

    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const { items, total, unreadCount } = await NotificationsRepository.list(filter, {
      skip,
      limit,
    });
    const notifications = items.map((n: any) => toNotificationDTO(n));
    const meta = {
      ...buildPaginationMeta(total, page, limit),
      unreadCount,
    };

    return {
      notifications,
      meta,
    };
  }

  static async markAsRead({
    notificationId,
    userId,
  }: {
    notificationId: string;
    userId: string;
  }): Promise<NotificationDTO> {
    const notif = await NotificationsRepository.findById(notificationId);
    if (!notif || notif.userId.toString() !== userId.toString()) {
      throw AppError.notFound("Notification not found");
    }

    if (!notif.isRead) {
      notif.isRead = true;
      notif.readAt = new Date();
      await notif.save();
    }

    return toNotificationDTO(notif);
  }

  static async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await NotificationsRepository.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return {
      modifiedCount: result.modifiedCount || 0,
    };
  }
}

// NotificationContract implementation
registerNotificationService({
  async notify(payload: NotificationPayload): Promise<void> {
    let recipients = payload.recipientIds || [];

    // If no recipients specified and it's an admin-facing notification
    if (recipients.length === 0 && payload.type === "ISSUE_CREATED") {
      const admins = await User.find({ role: ROLES.ADMIN, isBlocked: false }).select("_id").lean();
      recipients = admins.map((a: any) => a._id.toString());
    }

    const uniqueRecipients = [...new Set(recipients.map(String))];
    if (uniqueRecipients.length === 0) return;

    const notifs = uniqueRecipients.map((recipientId) => ({
      userId: recipientId as any,
      type: payload.type,
      message: payload.message,
      issueId: payload.issueId as any || null,
      assignmentId: payload.assignmentId as any || null,
      isRead: false,
    }));

    await NotificationsRepository.insertMany(notifs);
  },
});

export default NotificationsService;
