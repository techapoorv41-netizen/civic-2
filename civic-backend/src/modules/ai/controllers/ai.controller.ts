import { Request, Response } from "express";
import AIService from "../services/ai.service";
import { ok } from "../../../shared/utils/response";

export class AIController {
  static async generateAnalysis(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await AIService.generateAnalysis({
      issueId,
      userId: req.user!.id,
    });
    return ok(res, result);
  }

  static async getAnalysis(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await AIService.getAnalysis(issueId);
    return ok(res, result);
  }

  static async sendBotPrompt(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const result = await AIService.sendBotPrompt({
      issueId,
      userId: req.user!.id,
      prompt: req.body.prompt,
    });
    return ok(res, result);
  }

  static async getBotHistory(req: Request, res: Response): Promise<Response> {
    const issueId = String(req.params.issueId);
    const userId = req.user ? req.user.id : undefined;
    const { items, meta } = await AIService.getBotHistory({
      issueId,
      userId,
      query: req.query,
    });
    return ok(res, items, meta);
  }
}

export default AIController;
