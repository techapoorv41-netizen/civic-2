import { Router } from "express";
import AIController from "../controllers/ai.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate, optionalAuthenticate } from "../../../middlewares/auth.middleware";
import { aiLimiter } from "../../../middlewares/rateLimiter.middleware";
import { sendBotPromptSchema } from "../schemas/ai.schema";

const router = Router({ mergeParams: true });

// Issue-scoped routes: /issues/:issueId/ai-analysis and /issues/:issueId/ai-responses
router.get("/:issueId/ai-analysis", optionalAuthenticate, asyncHandler(AIController.getAnalysis));
router.post(
  "/:issueId/ai-analysis",
  authenticate,
  aiLimiter,
  asyncHandler(AIController.generateAnalysis)
);

router.get(
  "/:issueId/ai-responses",
  optionalAuthenticate,
  asyncHandler(AIController.getBotHistory)
);

router.post(
  "/:issueId/ai-responses",
  authenticate,
  aiLimiter,
  validate({ body: sendBotPromptSchema }),
  asyncHandler(AIController.sendBotPrompt)
);

// Direct /ai routes
router.get("/analysis/:issueId", optionalAuthenticate, asyncHandler(AIController.getAnalysis));
router.post(
  "/analysis/:issueId",
  authenticate,
  aiLimiter,
  asyncHandler(AIController.generateAnalysis)
);
router.get("/responses/:issueId", optionalAuthenticate, asyncHandler(AIController.getBotHistory));
router.post(
  "/responses/:issueId",
  authenticate,
  aiLimiter,
  validate({ body: sendBotPromptSchema }),
  asyncHandler(AIController.sendBotPrompt)
);

export { router as aiRouter };
export default router;
