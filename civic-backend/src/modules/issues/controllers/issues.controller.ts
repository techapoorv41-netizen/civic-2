import { Request, Response } from "express";
import IssuesService from "../services/issues.service";
import { ok, created } from "../../../shared/utils/response";

export class IssuesController {
  static async createIssue(req: Request, res: Response): Promise<Response> {
    const result = await IssuesService.createIssue({
      userId: req.user!.id,
      data: req.body,
    });
    return created(res, result);
  }

  static async getIssues(req: Request, res: Response): Promise<Response> {
    const { issues, meta } = await IssuesService.getIssues({
      userId: req.user?.id,
      userRole: req.user?.role,
      query: req.query,
    });
    return ok(res, issues, meta);
  }

  static async getIssueById(req: Request, res: Response): Promise<Response> {
    const result = await IssuesService.getIssueById({
      issueId: String(req.params.id),
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    return ok(res, result);
  }

  static async updateIssue(req: Request, res: Response): Promise<Response> {
    const result = await IssuesService.updateIssue({
      issueId: String(req.params.id),
      userId: req.user!.id,
      userRole: req.user!.role,
      data: req.body,
    });
    return ok(res, result);
  }

  static async verifyIssue(req: Request, res: Response): Promise<Response> {
    const result = await IssuesService.verifyIssue({
      issueId: String(req.params.id),
      adminId: req.user!.id,
      remarks: req.body?.remarks,
    });
    return ok(res, result);
  }

  static async deleteIssue(req: Request, res: Response): Promise<Response> {
    const result = await IssuesService.deleteIssue({
      issueId: String(req.params.id),
      userId: req.user!.id,
      userRole: req.user!.role,
    });
    return ok(res, result);
  }

  static async getHistory(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId || req.params.id);
    const result = await IssuesService.getHistory(issueId, req.user);
    return ok(res, result);
  }
}

export default IssuesController;
