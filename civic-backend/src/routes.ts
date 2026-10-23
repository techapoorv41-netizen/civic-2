import { Router } from "express";

import authRouter from "./modules/auth/routes/auth.routes";
import usersRouter from "./modules/users/routes/users.routes";
import officialsRouter from "./modules/officials/routes/officials.routes";
import categoriesRouter from "./modules/categories/routes/categories.routes";
import issuesRouter from "./modules/issues/routes/issues.routes";
import reportsRouter from "./modules/reports";
import complaintsRouter from "./modules/complaints";
import assignmentsRouter from "./modules/assignments/routes/assignments.routes";
import attachmentsRouter from "./modules/attachments/routes/attachments.routes";
import commentsRouter from "./modules/comments/routes/comments.routes";
import notificationsRouter from "./modules/notifications/routes/notifications.routes";
import adminRouter from "./modules/admin/routes/admin.routes";
import aiRouter from "./modules/ai/routes/ai.routes";
import issueHistoryRouter from "./modules/issueHistory/routes/issueHistory.routes";

const router = Router();

// Sub-resources mounted under /issues (before general /issues routes)
router.use("/issues", commentsRouter);      // /issues/:issueId/comments
router.use("/issues", issueHistoryRouter);  // /issues/:issueId/history
router.use("/issues", attachmentsRouter);   // /issues/:issueId/attachments
router.use("/issues", aiRouter);            // /issues/:issueId/ai-analysis, /issues/:issueId/ai-responses
router.use("/issues", issuesRouter);        // /issues, /issues/:id, /issues/:id/verify, etc.

// Standalone endpoints
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/officials", officialsRouter);
router.use("/categories", categoriesRouter);
router.use("/assignments", assignmentsRouter);
router.use("/attachments", attachmentsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);
router.use("/ai", aiRouter);
router.use("/issue-history", issueHistoryRouter);

// Backwards-compatible aliases
router.use("/reports", reportsRouter);
router.use("/complaints", complaintsRouter);

export default router;
