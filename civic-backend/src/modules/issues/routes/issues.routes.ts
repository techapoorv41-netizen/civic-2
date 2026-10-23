import { Router } from "express";
import IssuesController from "../controllers/issues.controller";
import AssignmentsController from "../../assignments/controllers/assignments.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate, optionalAuthenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import { idParams, issueIdParams, createIssueSchema, updateIssueSchema, listQuery } from "../schemas/issues.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: createIssueSchema }),
  asyncHandler(IssuesController.createIssue)
);

router.get(
  "/",
  optionalAuthenticate,
  validate({ query: listQuery }),
  asyncHandler(IssuesController.getIssues)
);

router.get(
  "/:id",
  optionalAuthenticate,
  validate({ params: idParams }),
  asyncHandler(IssuesController.getIssueById)
);

router.get(
  "/:issueId/history",
  authenticate,
  validate({ params: issueIdParams }),
  asyncHandler(IssuesController.getHistory)
);

router.patch(
  "/:id/verify",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: idParams }),
  asyncHandler(IssuesController.verifyIssue)
);

router.post(
  "/:id/assign",
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(AssignmentsController.assignIssue)
);

router.post(
  "/:issueId/assign",
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(AssignmentsController.assignIssue)
);

router.patch(
  "/:id",
  authenticate,
  validate({ params: idParams, body: updateIssueSchema }),
  asyncHandler(IssuesController.updateIssue)
);

router.delete(
  "/:id",
  authenticate,
  validate({ params: idParams }),
  asyncHandler(IssuesController.deleteIssue)
);

export { router as issuesRouter };
export default router;
