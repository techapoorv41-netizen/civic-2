import { Request, Response } from "express";
import AssignmentsService from "../services/assignments.service";
import { ok, created } from "../../../shared/utils/response";

export class AssignmentsController {
  static async assignIssue(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId || req.params.id || req.body.issueId);
    const result = await AssignmentsService.assignIssue({
      ...req.body,
      issueId,
      adminId: req.user!.id,
    });
    return created(res, result);
  }

  static async getMyAssignments(req: Request, res: Response): Promise<Response> {
    const { assignments, meta } = await AssignmentsService.getMyAssignments({
      officialId: req.user!.id,
      query: req.query,
    });
    return ok(res, assignments, meta);
  }

  static async getAssignments(req: Request, res: Response): Promise<Response> {
    const { assignments, meta } = await AssignmentsService.getAssignments(req.query);
    return ok(res, assignments, meta);
  }

  static async acceptAssignment(req: Request, res: Response): Promise<Response> {
    const idOrIssueId = String(req.params.id || req.params.issueId);
    const result = await AssignmentsService.acceptAssignment({
      idOrIssueId,
      officialId: req.user!.id,
    });
    return ok(res, result);
  }

  static async rejectAssignment(req: Request, res: Response): Promise<Response> {
    const idOrIssueId = String(req.params.id || req.params.issueId);
    const result = await AssignmentsService.rejectAssignment({
      idOrIssueId,
      officialId: req.user!.id,
      data: req.body,
    });
    return ok(res, result);
  }

  static async completeAssignment(req: Request, res: Response): Promise<Response> {
    const idOrIssueId = String(req.params.id || req.params.issueId);
    const result = await AssignmentsService.completeAssignment({
      idOrIssueId,
      officialId: req.user!.id,
      data: req.body,
    });
    return ok(res, result);
  }
}

export default AssignmentsController;
