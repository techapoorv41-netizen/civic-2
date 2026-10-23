import { z } from "zod";

export const issueIdParamSchema = z.object({
  issueId: z.string().min(1, "issueId is required"),
});

export const sendBotPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(500, "Prompt cannot exceed 500 characters"),
});

export const getResponsesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export default { issueIdParamSchema, sendBotPromptSchema, getResponsesQuerySchema };
