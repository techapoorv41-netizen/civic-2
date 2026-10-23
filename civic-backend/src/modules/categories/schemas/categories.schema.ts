import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60).optional(),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export default { createCategorySchema, updateCategorySchema, categoryIdParamSchema };
