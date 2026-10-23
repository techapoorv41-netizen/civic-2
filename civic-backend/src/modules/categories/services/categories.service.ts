import CategoriesRepository from "../repositories/categories.repository";
import AppError from "../../../errors/AppError";
import auditService from "../../../shared/contracts/audit";
import { toCategoryDTO } from "../mappers/categories.mapper";
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryDTO } from "../dtos/categories.dto";

export class CategoriesService {
  static async getCategories(query: any = {}): Promise<CategoryDTO[]> {
    const filter: any = {};
    if (query.all !== "true") {
      filter.isActive = true;
    }
    const categories = await CategoriesRepository.list(filter);
    return categories.map((c: any) => toCategoryDTO(c)!);
  }

  static async getCategoryById(id: string): Promise<CategoryDTO> {
    const category = await CategoriesRepository.findById(id);
    if (!category) {
      throw AppError.notFound("Category not found");
    }
    return toCategoryDTO(category)!;
  }

  static async createCategory({
    name,
    description,
    icon,
    adminId,
  }: CreateCategoryDTO & { adminId?: string }): Promise<CategoryDTO> {
    const trimmedName = name.trim();
    const existing = await CategoriesRepository.findByName(trimmedName);
    if (existing) {
      throw AppError.conflict("Category with this name already exists");
    }

    let category;
    try {
      category = await CategoriesRepository.create({
        name: trimmedName,
        description: description ? description.trim() : null,
        icon: icon || null,
        createdBy: adminId as any || null,
        isActive: true,
      });
    } catch (e: any) {
      if (e.code === 11000) {
        throw AppError.conflict("Category with this name already exists");
      }
      throw e;
    }

    if (adminId) {
      await auditService.log({
        actorId: adminId,
        action: "CATEGORY_CREATED",
        targetType: "Category",
        targetId: category._id.toString(),
        metadata: { name: category.name },
      });
    }

    return toCategoryDTO(category)!;
  }

  static async updateCategory(
    id: string,
    data: UpdateCategoryDTO,
    adminId?: string
  ): Promise<CategoryDTO> {
    const category = await CategoriesRepository.findById(id);
    if (!category) {
      throw AppError.notFound("Category not found");
    }

    if (data.name && data.name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await CategoriesRepository.findByName(data.name);
      if (duplicate && duplicate._id.toString() !== id) {
        throw AppError.conflict("Another category with this name already exists");
      }
      category.name = data.name.trim();
    }

    if (data.description !== undefined) {
      category.description = data.description ? data.description.trim() : null;
    }

    if (data.icon !== undefined) {
      category.icon = data.icon;
    }

    if (data.isActive !== undefined) {
      category.isActive = Boolean(data.isActive);
    }

    await category.save();

    if (adminId) {
      await auditService.log({
        actorId: adminId,
        action: "CATEGORY_UPDATED",
        targetType: "Category",
        targetId: category._id.toString(),
      });
    }

    return toCategoryDTO(category)!;
  }

  static async deleteCategory(id: string): Promise<{ id: string; isActive: boolean }> {
    const category = await CategoriesRepository.findById(id);
    if (!category) {
      throw AppError.notFound("Category not found");
    }

    category.isActive = false;
    await category.save();
    return { id, isActive: false };
  }
}

export default CategoriesService;
