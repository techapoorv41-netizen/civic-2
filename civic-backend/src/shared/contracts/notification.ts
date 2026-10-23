import Notification from "../../modules/notifications/entities/Notification.entity";
import { logger } from "../utils/logger";
import UserDirectory from "./userDirectory";
import IssueLookup from "./issueLookup";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes";

export interface NotifyParams {
  type: string;
  recipientIds?: string[];
  message: string;
  issueId?: string;
  assignmentId?: string;
  excludeUserId?: string;
  userId?: string;
}

export type NotificationPayload = NotifyParams;

export class NotificationService {
  static async notify({
    type,
    recipientIds,
    message,
    issueId,
    assignmentId,
    excludeUserId,
  }: NotifyParams): Promise<boolean> {
    try {
      let targets = Array.isArray(recipientIds) && recipientIds.length > 0 ? [...recipientIds] : [];

      if (targets.length === 0) {
        targets = await this.resolveRecipients(type, { issueId, assignmentId });
      }

      if (excludeUserId) {
        targets = targets.filter((id) => id.toString() !== excludeUserId.toString());
      }

      const uniqueTargets = [...new Set(targets.map((id) => id.toString()))].filter(Boolean);

      if (uniqueTargets.length === 0) {
        return true;
      }

      const docs = uniqueTargets.map((userId) => ({
        userId,
        type,
        message,
        issueId: issueId || null,
        assignmentId: assignmentId || null,
        isRead: false,
        createdAt: new Date(),
      }));

      await Notification.insertMany(docs, { ordered: false });
      logger.info({ type, recipientsCount: uniqueTargets.length, issueId }, "Notifications dispatched successfully");
      return true;
    } catch (error: any) {
      logger.error({ error: error.message, type, issueId }, "Notification dispatch failed safely");
      return false;
    }
  }

  static async resolveRecipients(
    type: string,
    { issueId, assignmentId: _assignmentId }: { issueId?: string; assignmentId?: string }
  ): Promise<string[]> {
    const adminIds = await UserDirectory.listAdminIds();
    let issue: any = null;

    if (issueId) {
      issue = await IssueLookup.getBasic(issueId);
    }

    switch (type) {
      case NOTIFICATION_TYPES.ISSUE_CREATED:
      case "ISSUE_CREATED":
        return adminIds;

      case NOTIFICATION_TYPES.ISSUE_VERIFIED:
      case "ISSUE_VERIFIED":
        return issue?.reporterId ? [issue.reporterId] : [];

      case NOTIFICATION_TYPES.ISSUE_ASSIGNED:
      case "ISSUE_ASSIGNED": {
        const recipients: string[] = [];
        if (issue?.assignedOfficialId) recipients.push(issue.assignedOfficialId);
        if (issue?.reporterId) recipients.push(issue.reporterId);
        return recipients;
      }

      case NOTIFICATION_TYPES.ASSIGNMENT_ACCEPTED:
      case "ASSIGNMENT_ACCEPTED": {
        const recipients = [...adminIds];
        if (issue?.reporterId) recipients.push(issue.reporterId);
        return recipients;
      }

      case NOTIFICATION_TYPES.ASSIGNMENT_REJECTED:
      case "ASSIGNMENT_REJECTED":
        return adminIds;

      case NOTIFICATION_TYPES.ISSUE_STATUS_CHANGED:
      case "ISSUE_STATUS_CHANGED":
        return issue?.reporterId ? [issue.reporterId] : [];

      case NOTIFICATION_TYPES.ISSUE_RESOLVED:
      case "ISSUE_RESOLVED": {
        const recipients = [...adminIds];
        if (issue?.reporterId) recipients.push(issue.reporterId);
        return recipients;
      }

      case NOTIFICATION_TYPES.COMMENT_ADDED:
      case "COMMENT_ADDED": {
        const recipients: string[] = [];
        if (issue?.reporterId) recipients.push(issue.reporterId);
        if (issue?.assignedOfficialId) recipients.push(issue.assignedOfficialId);
        return recipients;
      }

      case NOTIFICATION_TYPES.OFFICIAL_VERIFIED:
      case "OFFICIAL_VERIFIED":
        return [];

      default:
        return [];
    }
  }
}

export const registerNotificationService = (_impl: any): void => {
  // Compatibility stub
};

export const notificationService = NotificationService;

// CJS interop
(NotificationService as any).default = NotificationService;
(NotificationService as any).notificationService = NotificationService;
(NotificationService as any).registerNotificationService = registerNotificationService;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = NotificationService;
}

export default NotificationService;
