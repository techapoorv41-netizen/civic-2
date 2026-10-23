import { PaginationMeta } from "../../../shared/utils/pagination";

export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  issueId: string | null;
  assignmentId: string | null;
  createdAt: string | null;
}

export interface PaginatedNotificationsDTO {
  notifications: NotificationDTO[];
  meta: PaginationMeta & { unreadCount: number };
}
