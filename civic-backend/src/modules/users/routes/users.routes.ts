import { Router } from "express";
import UsersController from "../controllers/users.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import { updateMeSchema, getUserByIdParamsSchema, getUsersQuerySchema } from "../schemas/users.schema";

const router = Router();

router.patch(
  "/me",
  authenticate,
  validate({ body: updateMeSchema }),
  asyncHandler(UsersController.updateMe)
);

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ query: getUsersQuerySchema }),
  asyncHandler(UsersController.getUsers)
);

router.get(
  "/:id",
  authenticate,
  validate({ params: getUserByIdParamsSchema }),
  asyncHandler(UsersController.getUserById)
);

export { router as usersRouter };
export default router;
