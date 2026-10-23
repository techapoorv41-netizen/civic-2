import { z } from "zod";

export const createCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Comment message cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export const issueIdParamSchema = z.object({
  issueId: z.string().min(1, "issueId is required"),
});

export const getCommentsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export default { createCommentSchema, issueIdParamSchema, getCommentsQuerySchema };
