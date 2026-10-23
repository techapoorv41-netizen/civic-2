import { Request, Response } from "express";
import AttachmentsService from "../services/attachments.service";
import { ok, created } from "../../../shared/utils/response";

export class AttachmentsController {
  static async uploadAttachment(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await AttachmentsService.uploadAttachment({
      issueId,
      user: req.user!,
      file: req.file!,
    });
    return created(res, result);
  }

  static async getAttachments(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await AttachmentsService.getAttachments({
      issueId,
      user: req.user,
    });
    return ok(res, result);
  }

  static async deleteAttachment(req: Request, res: Response): Promise<Response> {
    const attachmentId = String(req.params.id);
    const result = await AttachmentsService.deleteAttachment({
      attachmentId,
      user: req.user!,
    });
    return ok(res, result);
  }
}

export default AttachmentsController;
