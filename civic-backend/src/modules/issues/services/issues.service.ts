import IssuesRepository from "../repositories/issues.repository";
import IssueHistoryRepository from "../repositories/issueHistory.repository";
import IssueStatusService from "./issueStatus.service";
import CategoriesRepository from "../../categories/repositories/categories.repository";
import AppError from "../../../errors/AppError";
import { toIssueDTO } from "../mappers/issues.mapper";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { ROLES } from "../../../shared/constants/roles";
import { NOTIFICATION_TYPES } from "../../../shared/constants/notificationTypes";
import { AUDIT_ACTIONS } from "../../../shared/constants/auditActions";
import notificationService from "../../../shared/contracts/notification";
import auditService from "../../../shared/contracts/audit";
import { registerIssueLookup, BasicIssue } from "../../../shared/contracts/issueLookup";
import { registerIssueStatsService, IssueStats } from "../../../shared/contracts/issueStats";
import { CreateIssueDTO, UpdateIssueDTO, IssueDTO, PaginatedIssuesDTO } from "../dtos/issues.dto";
import Issue, { IIssue } from "../entities/Issue.entity";
import { FilterQuery, Types } from "mongoose";

export class IssuesService {
  static async createIssue({
    userId,
    data,
  }: {
    userId: string;
    data: CreateIssueDTO;
  }): Promise<IssueDTO> {
    let categoryId: Types.ObjectId | null = null;
    let categoryName: string | null = null;

    const catParam = data.categoryId || data.category;
    if (catParam) {
      if (typeof catParam === "string" && /^[0-9a-fA-F]{24}$/.test(catParam)) {
        const cat = await CategoriesRepository.findById(catParam);
        if (cat) {
          categoryId = cat._id as Types.ObjectId;
          categoryName = cat.name;
        }
      } else if (typeof catParam === "string") {
        const cat = await CategoriesRepository.findByName(catParam);
        if (cat) {
          categoryId = cat._id as Types.ObjectId;
          categoryName = cat.name;
        } else {
          categoryName = catParam.trim();
        }
      }
    }

    const lat = data.latitude ?? data.location?.lat ?? null;
    const lng = data.longitude ?? data.location?.lng ?? null;
    const address =
      data.locationAddress ??
      data.location?.address ??
      (typeof data.location === "string" ? data.location : null);

    const issue = await IssuesRepository.create({
      title: data.title.trim(),
      description: data.description.trim(),
      reportedBy: userId as any,
      reporterId: userId as any,
      category: categoryId,
      categoryId: categoryId,
      categoryName: categoryName || "General",
      priority: data.priority || "medium",
      status: "pending",
      locationAddress: address,
      latitude: lat !== null ? Number(lat) : null,
      longitude: lng !== null ? Number(lng) : null,
      images: Array.isArray(data.images) ? data.images : [],
    });

    await IssueHistoryRepository.create({
      issueId: issue._id,
      oldStatus: null,
      previousStatus: null,
      newStatus: "pending",
      changedBy: userId,
      actorId: userId,
      remarks: "Issue initially reported",
    });

    await notificationService.notify({
      type: NOTIFICATION_TYPES.ISSUE_CREATED,
      message: `New issue reported: "${issue.title}"`,
      issueId: issue._id.toString(),
    });

    const populated = await IssuesRepository.findById(issue._id);
    return toIssueDTO(populated || issue);
  }

  static async getIssues({
    userId,
    userRole,
    query = {},
  }: {
    userId?: string;
    userRole?: string;
    query?: any;
  }): Promise<PaginatedIssuesDTO> {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IIssue> = { isDeleted: false };

    // D11: Role-based visibility enforcement
    if (userRole === ROLES.CITIZEN) {
      if (query.all !== "true" && query.scope !== "all") {
        filter.reportedBy = userId as any;
      }
    } else if (userRole === ROLES.OFFICIAL) {
      if (query.all !== "true" && query.scope !== "all") {
        filter.assignedTo = userId as any;
      }
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.category) {
      if (/^[0-9a-fA-F]{24}$/.test(query.category)) {
        filter.$or = [{ category: query.category }, { categoryId: query.category }];
      } else {
        filter.categoryName = { $regex: new RegExp(`^${query.category.trim()}$`, "i") };
      }
    }

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { locationAddress: { $regex: escaped, $options: "i" } },
      ];
    }

    if (query.assignedTo) {
      filter.assignedTo = query.assignedTo === "me" ? userId : query.assignedTo;
    }

    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from && { $gte: new Date(query.from) }),
        ...(query.to && { $lte: new Date(query.to) }),
      };
    }

    const { items, total } = await IssuesRepository.list(filter, { skip, limit, sort });
    const issues = items.map((i: any) => toIssueDTO(i));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      issues,
      meta,
    };
  }

  static async getIssueById({
    issueId,
    userId,
    userRole,
  }: {
    issueId: string;
    userId?: string;
    userRole?: string;
  }): Promise<IssueDTO> {
    const issue = await IssuesRepository.findById(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    // Role-based visibility access check
    if (userRole && userRole !== ROLES.ADMIN) {
      const reporterId = (issue.reportedBy?._id || issue.reportedBy || issue.reporterId)?.toString();
      const assignedId = (issue.assignedTo?._id || issue.assignedTo || issue.assignedOfficialId)?.toString();

      if (userRole === ROLES.CITIZEN && reporterId !== userId) {
        throw AppError.notFound("Issue not found");
      }
      if (userRole === ROLES.OFFICIAL && assignedId !== userId && reporterId !== userId) {
        throw AppError.notFound("Issue not found");
      }
    }

    return toIssueDTO(issue);
  }

  static async updateIssue({
    issueId,
    userId,
    userRole,
    data,
  }: {
    issueId: string;
    userId: string;
    userRole: string;
    data: UpdateIssueDTO;
  }): Promise<IssueDTO> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const reporterId = (issue.reportedBy || issue.reporterId)?.toString();
    const assignedId = (issue.assignedTo || issue.assignedOfficialId)?.toString();

    const isReporter = reporterId === userId;
    const isAssigned = assignedId === userId;
    const isAdmin = userRole === ROLES.ADMIN;

    if (!isReporter && !isAssigned && !isAdmin) {
      throw AppError.forbidden("You do not have permission to edit this issue");
    }

    if (data.status && data.status !== issue.status) {
      await IssueStatusService.transitionStatus({
        issueId,
        newStatus: data.status,
        userId,
        userRole,
        remarks: data.remarks,
      });
    }

    const patch: any = {};
    if (data.title !== undefined) patch.title = data.title.trim();
    if (data.description !== undefined) patch.description = data.description.trim();
    if (data.priority !== undefined && (isAdmin || isAssigned)) patch.priority = data.priority;
    if (data.remarks !== undefined) patch.remarks = data.remarks.trim();
    if (Array.isArray(data.images)) patch.images = data.images;

    if (data.locationAddress !== undefined) patch.locationAddress = data.locationAddress;
    if (data.latitude !== undefined) patch.latitude = data.latitude;
    if (data.longitude !== undefined) patch.longitude = data.longitude;

    const updated = await IssuesRepository.updateById(issueId, { $set: patch });
    return toIssueDTO(updated || issue);
  }

  static async verifyIssue({
    issueId,
    adminId,
    remarks,
  }: {
    issueId: string;
    adminId: string;
    remarks?: string;
  }): Promise<IssueDTO> {
    const updated = await IssueStatusService.transitionStatus({
      issueId,
      newStatus: "verified",
      userId: adminId,
      userRole: ROLES.ADMIN,
      remarks,
    });

    await auditService.log({
      actorId: adminId,
      action: AUDIT_ACTIONS.ISSUE_VERIFIED,
      targetType: "Issue",
      targetId: issueId,
    });

    const populated = await IssuesRepository.findById(issueId);
    return toIssueDTO(populated || updated);
  }

  static async deleteIssue({
    issueId,
    userId,
    userRole,
  }: {
    issueId: string;
    userId: string;
    userRole: string;
  }): Promise<{ id: string; isDeleted: boolean }> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const reporterId = (issue.reportedBy || issue.reporterId)?.toString();
    const isReporter = reporterId === userId;
    const isAdmin = userRole === ROLES.ADMIN;

    if (!isAdmin && !(isReporter && issue.status === "pending")) {
      throw AppError.forbidden("Only administrators or reporters of pending issues may delete this record");
    }

    await IssuesRepository.softDelete(issueId);

    if (isAdmin) {
      await auditService.log({
        actorId: userId,
        action: AUDIT_ACTIONS.ISSUE_DELETED,
        targetType: "Issue",
        targetId: issueId,
      });
    }

    return { id: issueId, isDeleted: true };
  }

  static async getHistory(issueId: string, _requestingUser?: { id: string; role: string }) {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    return await IssueHistoryRepository.listByIssueId(issueId);
  }
}

// Register cross-module contracts
registerIssueLookup({
  async getBasic(issueId: string): Promise<BasicIssue | null> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) return null;
    return {
      id: issue._id.toString(),
      title: issue.title,
      reporterId: (issue.reportedBy || issue.reporterId)?.toString() || "",
      assignedOfficialId: (issue.assignedTo || issue.assignedOfficialId)?.toString() || null,
      status: issue.status,
    };
  },
});

registerIssueStatsService({
  async getCounts(): Promise<IssueStats> {
    const [total, byStatusAgg, byCategoryAgg] = await Promise.all([
      Issue.countDocuments({ isDeleted: false }),
      Issue.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$categoryName", count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item: any) => {
      byStatus[item._id || "unknown"] = item.count;
    });

    const byCategory: Record<string, number> = {};
    byCategoryAgg.forEach((item: any) => {
      byCategory[item._id || "Uncategorized"] = item.count;
    });

    return { total, byStatus, byCategory };
  },
});

export default IssuesService;
