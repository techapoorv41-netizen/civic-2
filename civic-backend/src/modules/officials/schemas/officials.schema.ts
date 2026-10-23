import { z } from "zod";

export const createOfficialProfileSchema = z.object({
  department: z.string().trim().min(2, "Department is required"),
  designation: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  area: z.string().trim().optional(),
});

export const getOfficialsQuerySchema = z.object({
  isVerified: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  department: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export const officialIdParamSchema = z.object({
  id: z.string().min(1, "Official profile ID is required"),
});

export default {
  createOfficialProfileSchema,
  getOfficialsQuerySchema,
  officialIdParamSchema,
};
