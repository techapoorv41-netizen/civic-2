import { z } from "zod";
import { ROLES } from "../../../shared/constants/roles";

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    phone: z.string().trim().optional(),
  })
  .strict({
    message: "Only 'name' and 'phone' fields can be updated. Email, role, or unknown fields cannot be modified.",
  });

export const getUserByIdParamsSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const getUsersQuerySchema = z.object({
  role: z.enum([ROLES.CITIZEN, ROLES.OFFICIAL, ROLES.ADMIN]).optional(),
  isBlocked: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  search: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export default { updateMeSchema, getUserByIdParamsSchema, getUsersQuerySchema };
