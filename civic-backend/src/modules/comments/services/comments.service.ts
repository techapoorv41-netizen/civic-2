import CommentsRepository from "../repositories/comments.repository";
import UserRepository from "../../users/repositories/user.repository";
import AppError from "../../../errors/AppError";
import issueLookup from "../../../shared/contracts/issueLookup";
import notificationService from "../../../shared/contracts/notification";
import { NOTIFICATION_TYPES } from "../../../shared/constants/notificationTypes";
import { ROLES } from "../../../shared/constants/roles";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { toCommentDTO } from "../mappers/comments.mapper";
import { CommentDTO, PaginatedCommentsDTO } from "../dtos/comments.dto";

export class CommentsService {
  private static verifyAccess(issue: any, userId: string, userRole: string): boolean {
    if (userRole === ROLES.ADMIN) return true;
    if (issue.reporterId && issue.reporterId.toString() === userId.toString()) return true;
    if (issue.assignedOfficialId && issue.assignedOfficialId.toString() === userId.toString()) return true;
    return false;
  }

  static async createComment({
    issueId,
    authorId,
    message,
    userRole,
  }: {
    issueId: string;
    authorId: string;
    message: string;
    userRole: string;
  }): Promise<CommentDTO> {
    const issue = await issueLookup.getBasic(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    if (!this.verifyAccess(issue, authorId, userRole)) {
      throw AppError.forbidden("You are not authorized to comment on this issue");
    }

    const comment = await CommentsRepository.create({
      issueId: issueId as any,
      authorId: authorId as any,
      message: message.trim(),
    });

    const author = await UserRepository.findById(authorId);

    const recipientIds: string[] = [];
    if (issue.reporterId && issue.reporterId !== authorId) {
      recipientIds.push(issue.reporterId);
    }
    if (issue.assignedOfficialId && issue.assignedOfficialId !== authorId) {
      recipientIds.push(issue.assignedOfficialId);
    }

    if (recipientIds.length > 0) {
      await notificationService.notify({
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        recipientIds,
        message: `A new comment was posted on issue: "${issue.title}"`,
        issueId,
      });
    }

    return toCommentDTO(comment, author);
  }

  static async getComments({
    issueId,
    userId,
    userRole,
    query = {},
  }: {
    issueId: string;
    userId: string;
    userRole: string;
    query?: any;
  }): Promise<PaginatedCommentsDTO> {
    const issue = await issueLookup.getBasic(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    if (!this.verifyAccess(issue, userId, userRole)) {
      throw AppError.forbidden("You are not authorized to view comments on this issue");
    }

    const { page, limit, skip } = parsePagination(query);
    const filter = { issueId: issueId as any };

    const { items, total } = await CommentsRepository.list(filter, { skip, limit });
    const comments = items.map((c: any) => toCommentDTO(c));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      comments,
      meta,
    };
  }
}

export default CommentsService;
