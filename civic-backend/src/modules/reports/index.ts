import { Router } from "express";
import issuesRouter from "../issues";

const router = Router();
router.use("/", issuesRouter);

export * from "../issues";
export { router as reportsRouter };
export default router;
