import { Router } from "express";
import NotificationsController from "../controllers/notifications.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} from "../schemas/notifications.schema";

const router = Router();

router.get(
  "/",
  authenticate,
  validate({ query: getNotificationsQuerySchema }),
  asyncHandler(NotificationsController.getNotifications)
);

// /read-all must be registered before /:id/read to prevent route shadowing
router.patch("/read-all", authenticate, asyncHandler(NotificationsController.markAllAsRead));

router.patch(
  "/:id/read",
  authenticate,
  validate({ params: notificationIdParamSchema }),
  asyncHandler(NotificationsController.markAsRead)
);

export { router as notificationsRouter };
export default router;
