import { z } from "zod";

export const issueIdParamSchema = z.object({
  issueId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid issueId"),
});

export const attachmentIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid attachment ID"),
  issueId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid issueId").optional(),
});

export default { issueIdParamSchema, attachmentIdParamSchema };
