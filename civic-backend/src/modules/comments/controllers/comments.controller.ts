import { Request, Response } from "express";
import CommentsService from "../services/comments.service";
import { ok, created } from "../../../shared/utils/response";

export class CommentsController {
  static async createComment(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await CommentsService.createComment({
      issueId,
      authorId: req.user!.id,
      userRole: req.user!.role,
      message: req.body.message,
    });
    return created(res, result);
  }

  static async getComments(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const { comments, meta } = await CommentsService.getComments({
      issueId,
      userId: req.user!.id,
      userRole: req.user!.role,
      query: req.query,
    });
    return ok(res, comments, meta);
  }
}

export default CommentsController;
