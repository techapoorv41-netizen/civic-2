import IssuesRepository from "../repositories/issues.repository";
import IssueHistoryRepository from "../repositories/issueHistory.repository";
import AppError from "../../../errors/AppError";
import { ROLES } from "../../../shared/constants/roles";
import { NOTIFICATION_TYPES } from "../../../shared/constants/notificationTypes";
import notificationService from "../../../shared/contracts/notification";
import Issue, { IIssue } from "../entities/Issue.entity";

export const TRANSITIONS: Record<string, Record<string, string[]>> = {
  pending: {
    verified: [ROLES.ADMIN],
    rejected: [ROLES.ADMIN],
  },
  verified: {
    in_progress: [ROLES.OFFICIAL, ROLES.ADMIN],
    rejected: [ROLES.ADMIN],
  },
  in_progress: {
    resolved: [ROLES.OFFICIAL, ROLES.ADMIN],
  },
  resolved: {},
  rejected: {},
};

export class IssueStatusService {
  static async transitionStatus({
    issueId,
    newStatus,
    userId,
    userRole,
    remarks,
  }: {
    issueId: string;
    newStatus: string;
    userId: string;
    userRole: string;
    remarks?: string;
  }): Promise<IIssue> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const currentStatus = issue.status;

    if (currentStatus === newStatus) {
      return issue;
    }

    if (currentStatus === "resolved" || currentStatus === "rejected") {
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot transition from terminal status '${currentStatus}'`
      );
    }

    const allowedRoles = TRANSITIONS[currentStatus]?.[newStatus];
    if (!allowedRoles) {
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot move issue status from '${currentStatus}' to '${newStatus}'`
      );
    }

    if (!allowedRoles.includes(userRole)) {
      throw AppError.forbidden(
        `Role '${userRole}' is not permitted to perform transition '${currentStatus}' -> '${newStatus}'`
      );
    }

    if (userRole === ROLES.OFFICIAL) {
      const isAssigned = issue.assignedTo && issue.assignedTo.toString() === userId.toString();
      if (!isAssigned) {
        throw AppError.forbidden("You are not the assigned official for this issue");
      }
    }

    const patch: any = {
      status: newStatus,
    };

    if (remarks) {
      patch.remarks = remarks;
    }

    if (newStatus === "verified") {
      patch.verifiedByAdmin = true;
      patch.verifiedAt = new Date();
      patch.verifiedBy = userId;
    } else if (newStatus === "resolved") {
      patch.resolvedAt = new Date();
    }

    // Atomic update guaranteeing single winner in concurrent transitions
    const updated = await Issue.findOneAndUpdate(
      { _id: issueId, status: currentStatus, isDeleted: false },
      { $set: patch },
      { new: true }
    );

    if (!updated) {
      throw new AppError(
        409,
        "CONFLICT",
        "Issue status was modified concurrently by another transaction. Please refresh."
      );
    }

    await IssueHistoryRepository.create({
      issueId,
      oldStatus: currentStatus,
      previousStatus: currentStatus,
      newStatus,
      changedBy: userId,
      actorId: userId,
      remarks: remarks || null,
    });

    const reporterId = (issue.reportedBy || issue.reporterId)?.toString();
    if (reporterId) {
      let notifType: string = NOTIFICATION_TYPES.ISSUE_STATUS_CHANGED;
      let message = `Issue "${issue.title}" status changed to ${newStatus}`;

      if (newStatus === "verified") {
        notifType = NOTIFICATION_TYPES.ISSUE_VERIFIED;
        message = `Your reported issue "${issue.title}" has been verified by an administrator.`;
      } else if (newStatus === "resolved") {
        notifType = NOTIFICATION_TYPES.ISSUE_RESOLVED;
        message = `Your reported issue "${issue.title}" has been resolved.`;
      } else if (newStatus === "rejected") {
        notifType = NOTIFICATION_TYPES.ISSUE_REJECTED;
        message = `Your reported issue "${issue.title}" was marked as rejected.`;
      }

      await notificationService.notify({
        type: notifType,
        recipientIds: [reporterId],
        message,
        issueId,
      });
    }

    return updated;
  }
}

export default IssueStatusService;
