import { Router } from "express";
import CommentsController from "../controllers/comments.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import {
  createCommentSchema,
  issueIdParamSchema,
  getCommentsQuerySchema,
} from "../schemas/comments.schema";

const router = Router({ mergeParams: true });

router.post(
  "/:issueId/comments",
  authenticate,
  validate({ params: issueIdParamSchema, body: createCommentSchema }),
  asyncHandler(CommentsController.createComment)
);

router.get(
  "/:issueId/comments",
  authenticate,
  validate({ params: issueIdParamSchema, query: getCommentsQuerySchema }),
  asyncHandler(CommentsController.getComments)
);

export { router as commentsRouter };
export default router;
