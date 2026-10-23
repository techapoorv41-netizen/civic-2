import { Request, Response } from "express";
import CategoriesService from "../services/categories.service";
import { ok, created } from "../../../shared/utils/response";

export class CategoriesController {
  static async getCategories(req: Request, res: Response): Promise<Response> {
    const result = await CategoriesService.getCategories(req.query);
    return ok(res, result);
  }

  static async getCategoryById(req: Request, res: Response): Promise<Response> {
    const result = await CategoriesService.getCategoryById(String(req.params.id));
    return ok(res, result);
  }

  static async createCategory(req: Request, res: Response): Promise<Response> {
    const result = await CategoriesService.createCategory({
      ...req.body,
      adminId: req.user?.id,
    });
    return created(res, result);
  }

  static async updateCategory(req: Request, res: Response): Promise<Response> {
    const result = await CategoriesService.updateCategory(String(req.params.id), req.body, req.user?.id);
    return ok(res, result);
  }

  static async deleteCategory(req: Request, res: Response): Promise<Response> {
    const result = await CategoriesService.deleteCategory(String(req.params.id));
    return ok(res, result);
  }
}

export default CategoriesController;
