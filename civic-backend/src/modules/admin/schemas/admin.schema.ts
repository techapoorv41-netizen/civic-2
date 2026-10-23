import { z } from "zod";

export const blockUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason for suspension must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const getAuditLogsQuerySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  targetType: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export default {
  blockUserSchema,
  userIdParamSchema,
  getAuditLogsQuerySchema,
};
