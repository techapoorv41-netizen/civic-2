import { Router } from "express";
import OfficialsController from "../controllers/officials.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { ROLES } from "../../../shared/constants/roles";
import {
  createOfficialProfileSchema,
  getOfficialsQuerySchema,
  officialIdParamSchema,
} from "../schemas/officials.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(ROLES.OFFICIAL),
  validate({ body: createOfficialProfileSchema }),
  asyncHandler(OfficialsController.createProfile)
);

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ query: getOfficialsQuerySchema }),
  asyncHandler(OfficialsController.getOfficials)
);

router.get(
  "/:id",
  authenticate,
  validate({ params: officialIdParamSchema }),
  asyncHandler(OfficialsController.getOfficialById)
);

router.patch(
  "/:id/verify",
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ params: officialIdParamSchema }),
  asyncHandler(OfficialsController.verifyOfficial)
);

export { router as officialsRouter };
export default router;
