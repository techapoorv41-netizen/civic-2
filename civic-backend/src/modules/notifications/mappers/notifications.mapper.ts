import { NotificationDTO } from "../dtos/notifications.dto";

export const toNotificationDTO = (notif: any): NotificationDTO => {
  const raw = notif && notif.toObject ? notif.toObject() : { ...notif };
  return {
    id: (raw._id || raw.id).toString(),
    userId: (raw.userId?._id || raw.userId)?.toString(),
    type: raw.type,
    message: raw.message,
    isRead: Boolean(raw.isRead),
    readAt: raw.readAt ? new Date(raw.readAt).toISOString() : null,
    issueId: (raw.issueId?._id || raw.issueId)?.toString() || null,
    assignmentId: (raw.assignmentId?._id || raw.assignmentId)?.toString() || null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export default { toNotificationDTO };
