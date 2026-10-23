import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import asyncHandler from "../../../shared/utils/asyncHandler";
import validate from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { loginLimiter } from "../../../middlewares/rateLimiter.middleware";
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate({ body: registerSchema }), asyncHandler(AuthController.register));
router.post("/login", loginLimiter, validate({ body: loginSchema }), asyncHandler(AuthController.login));
router.post("/refresh", validate({ body: refreshSchema }), asyncHandler(AuthController.refresh));
router.post("/logout", validate({ body: logoutSchema }), asyncHandler(AuthController.logout));
router.get("/me", authenticate, asyncHandler(AuthController.getMe));

export { router as authRouter };
export default router;
