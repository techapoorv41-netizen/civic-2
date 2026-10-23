import AssignmentsRepository from "../repositories/assignments.repository";
import IssuesRepository from "../../issues/repositories/issues.repository";
import IssueAssignment, { IIssueAssignment } from "../entities/Assignment.entity";
import OfficialProfile from "../../officials/entities/OfficialProfile.entity";
import AppError from "../../../errors/AppError";
import userDirectory from "../../../shared/contracts/userDirectory";
import notificationService from "../../../shared/contracts/notification";
import auditService from "../../../shared/contracts/audit";
import IssueStatusService from "../../issues/services/issueStatus.service";
import { NOTIFICATION_TYPES } from "../../../shared/constants/notificationTypes";
import { AUDIT_ACTIONS } from "../../../shared/constants/auditActions";
import { ROLES } from "../../../shared/constants/roles";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { toAssignmentDTO } from "../mappers/assignments.mapper";
import {
  AssignIssueDTO,
  RejectAssignmentDTO,
  CompleteAssignmentDTO,
  AssignmentDTO,
  PaginatedAssignmentsDTO,
} from "../dtos/assignments.dto";
import { FilterQuery } from "mongoose";

export class AssignmentsService {
  static async findAssignment(idOrIssueId: string): Promise<IIssueAssignment | null> {
    let assignment = await AssignmentsRepository.findById(idOrIssueId);
    if (!assignment) {
      assignment = await AssignmentsRepository.findActiveByIssueId(idOrIssueId);
    }
    if (!assignment) {
      assignment = await AssignmentsRepository.findLatestByIssueId(idOrIssueId);
    }
    return assignment;
  }

  static async assignIssue({
    issueId,
    officialId,
    adminId,
    dueDate,
    remarks,
  }: AssignIssueDTO & { adminId: string }): Promise<AssignmentDTO> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    if (issue.status !== "verified") {
      throw new AppError(409, "INVALID_STATUS_TRANSITION", "Only verified issues can be assigned");
    }

    let resolvedOfficialId = officialId;
    try {
      const directProfile: any = await OfficialProfile.findById(officialId).lean();
      if (directProfile && directProfile.userId) {
        resolvedOfficialId = directProfile.userId.toString();
      }
    } catch {
      // Continue
    }

    const isEligible = await userDirectory.isAssignableOfficial(resolvedOfficialId);
    if (!isEligible) {
      throw new AppError(422, "VALIDATION_ERROR", "Official is not verified or is blocked", [
        { path: "officialId", message: "Official is not verified or is blocked" },
      ]);
    }

    let assignment: IIssueAssignment;
    try {
      assignment = await AssignmentsRepository.create({
        issueId: issue._id,
        officialId: resolvedOfficialId as any,
        assignedBy: adminId as any,
        dueDate: dueDate ? new Date(dueDate) : null,
        remarks: remarks || null,
        status: "assigned",
        isActive: true,
        statusLog: [
          {
            status: "assigned",
            at: new Date(),
            remarks: remarks || "Assigned by administrator",
          },
        ],
      });
    } catch (e: any) {
      if (e.code === 11000) {
        throw new AppError(409, "CONFLICT", "This issue already has an active assignment");
      }
      throw e;
    }

    await IssuesRepository.updateById(issueId, {
      $set: { assignedTo: resolvedOfficialId, assignedOfficialId: resolvedOfficialId },
    });

    await auditService.log({
      actorId: adminId,
      action: AUDIT_ACTIONS.ISSUE_ASSIGNED,
      targetType: "Issue",
      targetId: issueId,
      metadata: {
        officialId: resolvedOfficialId,
        assignmentId: assignment._id.toString(),
      },
    });

    const reporterId = (issue.reportedBy || issue.reporterId)?.toString();
    const recipientIds = [resolvedOfficialId];
    if (reporterId) recipientIds.push(reporterId);

    await notificationService.notify({
      type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
      recipientIds,
      message: `Issue "${issue.title}" has been assigned for resolution.`,
      issueId,
      assignmentId: assignment._id.toString(),
    });

    const populated = await AssignmentsRepository.findById(assignment._id);
    return toAssignmentDTO(populated || assignment);
  }

  static async getMyAssignments({
    officialId,
    query = {},
  }: {
    officialId: string;
    query?: any;
  }): Promise<PaginatedAssignmentsDTO> {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IIssueAssignment> = { officialId: officialId as any };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true" || query.isActive === true;
    }

    const { items, total } = await AssignmentsRepository.list(filter, { skip, limit, sort });
    const assignments = items.map((a: any) => toAssignmentDTO(a));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      assignments,
      meta,
    };
  }

  static async getAssignments(query: any = {}): Promise<PaginatedAssignmentsDTO> {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IIssueAssignment> = {};

    if (query.status) filter.status = query.status;
    if (query.officialId) filter.officialId = query.officialId;
    if (query.issueId) filter.issueId = query.issueId;

    const { items, total } = await AssignmentsRepository.list(filter, { skip, limit, sort });
    const assignments = items.map((a: any) => toAssignmentDTO(a));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      assignments,
      meta,
    };
  }

  static async acceptAssignment({
    idOrIssueId,
    officialId,
  }: {
    idOrIssueId: string;
    officialId: string;
  }): Promise<AssignmentDTO> {
    const now = new Date();

    const assignment = await IssueAssignment.findOneAndUpdate(
      {
        $or: [{ _id: idOrIssueId }, { issueId: idOrIssueId }],
        officialId,
        status: "assigned",
      },
      {
        $set: { status: "accepted", acceptedAt: now },
        $push: { statusLog: { status: "accepted", at: now, remarks: "Official accepted assignment" } },
      },
      { new: true }
    );

    if (!assignment) {
      const existing = await this.findAssignment(idOrIssueId);
      if (!existing) {
        throw AppError.notFound("Assignment not found");
      }
      if (existing.officialId.toString() !== officialId) {
        throw AppError.forbidden("You are not the assigned official for this task");
      }
      throw new AppError(409, "INVALID_ASSIGNMENT_STATE", `Assignment is already ${existing.status}`);
    }

    await IssueStatusService.transitionStatus({
      issueId: assignment.issueId.toString(),
      newStatus: "in_progress",
      userId: officialId,
      userRole: ROLES.OFFICIAL,
      remarks: "Work started by assigned official",
    });

    const populated = await AssignmentsRepository.findById(assignment._id);
    return toAssignmentDTO(populated || assignment);
  }

  static async rejectAssignment({
    idOrIssueId,
    officialId,
    data,
  }: {
    idOrIssueId: string;
    officialId: string;
    data: RejectAssignmentDTO;
  }): Promise<AssignmentDTO> {
    const now = new Date();

    const assignment = await IssueAssignment.findOneAndUpdate(
      {
        $or: [{ _id: idOrIssueId }, { issueId: idOrIssueId }],
        officialId,
        status: "assigned",
      },
      {
        $set: {
          status: "rejected",
          isActive: false,
          rejectedAt: now,
          rejectionReason: data.reason.trim(),
        },
        $push: { statusLog: { status: "rejected", at: now, remarks: data.reason.trim() } },
      },
      { new: true }
    );

    if (!assignment) {
      const existing = await this.findAssignment(idOrIssueId);
      if (!existing) {
        throw AppError.notFound("Assignment not found");
      }
      if (existing.officialId.toString() !== officialId) {
        throw AppError.forbidden("You are not the assigned official for this task");
      }
      throw new AppError(409, "INVALID_ASSIGNMENT_STATE", `Assignment is already ${existing.status}`);
    }

    // Reset assignedTo on issue
    await IssuesRepository.updateById(assignment.issueId, {
      $set: { assignedTo: null, assignedOfficialId: null },
    });

    const adminIds = await userDirectory.listAdminIds();
    await notificationService.notify({
      type: NOTIFICATION_TYPES.ASSIGNMENT_REJECTED,
      recipientIds: adminIds,
      message: `An official rejected assignment for issue. Reason: ${data.reason}`,
      issueId: assignment.issueId.toString(),
      assignmentId: assignment._id.toString(),
    });

    const populated = await AssignmentsRepository.findById(assignment._id);
    return toAssignmentDTO(populated || assignment);
  }

  static async completeAssignment({
    idOrIssueId,
    officialId,
    data,
  }: {
    idOrIssueId: string;
    officialId: string;
    data: CompleteAssignmentDTO;
  }): Promise<AssignmentDTO> {
    const now = new Date();
    const remarks = ((data.completionRemarks || (data as any).remarks || "") as string).trim();

    const assignment = await IssueAssignment.findOneAndUpdate(
      {
        $or: [{ _id: idOrIssueId }, { issueId: idOrIssueId }],
        officialId,
        status: "accepted",
      },
      {
        $set: {
          status: "completed",
          isActive: false,
          completedAt: now,
          completionRemarks: remarks,
        },
        $push: {
          statusLog: {
            status: "completed",
            at: now,
            remarks,
          },
        },
      },
      { new: true }
    );

    if (!assignment) {
      const existing = await this.findAssignment(idOrIssueId);
      if (!existing) {
        throw AppError.notFound("Assignment not found");
      }
      if (existing.officialId.toString() !== officialId) {
        throw AppError.forbidden("You are not the assigned official for this task");
      }
      throw new AppError(409, "INVALID_ASSIGNMENT_STATE", `Assignment is already ${existing.status}`);
    }

    await IssueStatusService.transitionStatus({
      issueId: assignment.issueId.toString(),
      newStatus: "resolved",
      userId: officialId,
      userRole: ROLES.OFFICIAL,
      remarks,
    });

    const populated = await AssignmentsRepository.findById(assignment._id);
    return toAssignmentDTO(populated || assignment);
  }
}

export default AssignmentsService;
