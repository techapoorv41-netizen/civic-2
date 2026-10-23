import { Request, Response } from "express";
import OfficialsService from "../services/officials.service";
import { ok, created } from "../../../shared/utils/response";

export class OfficialsController {
  static async createProfile(req: Request, res: Response): Promise<Response> {
    const result = await OfficialsService.createProfile({
      userId: req.user!.id,
      data: req.body,
    });
    return created(res, result);
  }

  static async getOfficials(req: Request, res: Response): Promise<Response> {
    const { officials, meta } = await OfficialsService.getOfficials(req.query);
    return ok(res, officials, meta);
  }

  static async getOfficialById(req: Request, res: Response): Promise<Response> {
    const result = await OfficialsService.getOfficialById({
      profileId: String(req.params.id),
      requestingUser: req.user!,
    });
    return ok(res, result);
  }

  static async verifyOfficial(req: Request, res: Response): Promise<Response> {
    const result = await OfficialsService.verifyOfficial({
      profileId: String(req.params.id),
      adminId: req.user!.id,
    });
    return ok(res, result);
  }
}

export default OfficialsController;
