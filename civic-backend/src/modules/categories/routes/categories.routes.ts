import { Router } from "express";
import CategoriesController from "../controllers/categories.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../schemas/categories.schema";

const router = Router();

router.get("/", asyncHandler(CategoriesController.getCategories));
router.get("/:id", validate({ params: categoryIdParamSchema }), asyncHandler(CategoriesController.getCategoryById));

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: createCategorySchema }),
  asyncHandler(CategoriesController.createCategory)
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  asyncHandler(CategoriesController.updateCategory)
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: categoryIdParamSchema }),
  asyncHandler(CategoriesController.deleteCategory)
);

export { router as categoriesRouter };
export default router;
