import { z } from "zod";

export const assignIssueSchema = z.object({
  issueId: z.string().min(1, "issueId is required").optional(),
  officialId: z.string().min(1, "officialId is required"),
  dueDate: z.string().optional(),
  remarks: z.string().trim().optional(),
});

export const rejectAssignmentSchema = z.object({
  reason: z.string().trim().min(3, "Rejection reason must be at least 3 characters"),
});

export const completeAssignmentSchema = z
  .object({
    remarks: z.string().trim().min(3, "Remarks must be at least 3 characters").optional(),
    completionRemarks: z.string().trim().min(3, "Completion remarks must be at least 3 characters").optional(),
  })
  .refine((data) => Boolean(data.remarks || data.completionRemarks), {
    message: "Completion remarks are required",
  });

export const assignmentIdParamSchema = z.object({
  id: z.string().min(1, "Assignment ID is required"),
});

export default {
  assignIssueSchema,
  rejectAssignmentSchema,
  completeAssignmentSchema,
  assignmentIdParamSchema,
};
