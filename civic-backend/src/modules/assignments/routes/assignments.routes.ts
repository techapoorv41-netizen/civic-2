import { Router } from "express";
import AssignmentsController from "../controllers/assignments.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import {
  assignIssueSchema,
  rejectAssignmentSchema,
  completeAssignmentSchema,
  assignmentIdParamSchema,
} from "../schemas/assignments.schema";

const router = Router();

// Official assignment inbox: GET /assignments/mine
router.get(
  "/mine",
  authenticate,
  authorize(ROLES.OFFICIAL),
  asyncHandler(AssignmentsController.getMyAssignments)
);

// Admin assignment operations: POST /assignments, GET /assignments
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: assignIssueSchema }),
  asyncHandler(AssignmentsController.assignIssue)
);

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(AssignmentsController.getAssignments)
);

// Official action endpoints
router.patch(
  "/:id/accept",
  authenticate,
  authorize(ROLES.OFFICIAL),
  validate({ params: assignmentIdParamSchema }),
  asyncHandler(AssignmentsController.acceptAssignment)
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(ROLES.OFFICIAL),
  validate({ params: assignmentIdParamSchema, body: rejectAssignmentSchema }),
  asyncHandler(AssignmentsController.rejectAssignment)
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize(ROLES.OFFICIAL),
  validate({ params: assignmentIdParamSchema, body: completeAssignmentSchema }),
  asyncHandler(AssignmentsController.completeAssignment)
);

export { router as assignmentsRouter };
export default router;
