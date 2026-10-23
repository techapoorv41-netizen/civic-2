import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import {
  blockUserSchema,
  userIdParamSchema,
  getAuditLogsQuerySchema,
} from "../schemas/admin.schema";

const router = Router();

// All admin routes require admin authentication
router.use(authenticate, authorize(ROLES.ADMIN));

router.patch(
  "/users/:id/block",
  validate({ params: userIdParamSchema, body: blockUserSchema }),
  asyncHandler(AdminController.blockUser)
);

router.patch(
  "/users/:id/unblock",
  validate({ params: userIdParamSchema }),
  asyncHandler(AdminController.unblockUser)
);

router.get(
  "/actions",
  validate({ query: getAuditLogsQuerySchema }),
  asyncHandler(AdminController.getAuditLogs)
);

router.get("/stats", asyncHandler(AdminController.getStats));

export { router as adminRouter };
export default router;
