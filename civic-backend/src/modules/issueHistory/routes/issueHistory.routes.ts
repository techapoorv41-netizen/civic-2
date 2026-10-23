import { Router } from "express";
import { IssuesController } from "../../issues/controllers/issues.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import { authenticate } from "../../../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/:issueId/history", authenticate, asyncHandler(IssuesController.getHistory));
router.get("/:issueId", authenticate, asyncHandler(IssuesController.getHistory));

export { router as issueHistoryRouter };
export default router;
