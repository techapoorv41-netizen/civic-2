import { Router } from "express";
import AttachmentsController from "../controllers/attachments.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate, optionalAuthenticate } from "../../../middlewares/auth.middleware";
import uploadSingle from "../../../middlewares/upload.middleware";
import { issueIdParamSchema, attachmentIdParamSchema } from "../schemas/attachments.schema";

const router = Router({ mergeParams: true });

router.post(
  "/:issueId/attachments",
  authenticate,
  validate({ params: issueIdParamSchema }),
  uploadSingle,
  asyncHandler(AttachmentsController.uploadAttachment)
);

router.get(
  "/:issueId/attachments",
  optionalAuthenticate,
  validate({ params: issueIdParamSchema }),
  asyncHandler(AttachmentsController.getAttachments)
);

router.delete(
  "/:id",
  authenticate,
  validate({ params: attachmentIdParamSchema }),
  asyncHandler(AttachmentsController.deleteAttachment)
);

router.delete(
  "/:issueId/attachments/:id",
  authenticate,
  validate({ params: attachmentIdParamSchema }),
  asyncHandler(AttachmentsController.deleteAttachment)
);

export { router as attachmentsRouter };
export default router;
