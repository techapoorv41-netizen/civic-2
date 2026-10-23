import { z } from "zod";
import { ISSUE_STATUSES, PRIORITIES } from "../../../shared/constants/issueStatus";

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId format");

export const idParams = z.object({
  id: objectIdSchema,
});

export const issueIdParams = z.object({
  issueId: objectIdSchema,
});

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  category: z.string().trim().optional(),
  categoryId: objectIdSchema.optional(),
  priority: z.enum(PRIORITIES).optional().default("medium"),
  location: z
    .object({
      address: z.string().trim().optional(),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  locationAddress: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  images: z.array(z.string().trim()).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  category: z.string().trim().optional(),
  categoryId: objectIdSchema.optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  remarks: z.string().trim().optional(),
  locationAddress: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  images: z.array(z.string().trim()).optional(),
});

export const listQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  all: z.string().optional(),
  scope: z.string().optional(),
  assignedTo: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export default {
  idParams,
  issueIdParams,
  create: createIssueSchema,
  createIssueSchema,
  update: updateIssueSchema,
  updateIssueSchema,
  listQuery,
};
