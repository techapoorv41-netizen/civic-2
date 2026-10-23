import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name cannot exceed 60 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one number"),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]{8,20}$/, "Invalid phone number format")
      .optional()
      .nullable(),
    role: z.enum(["citizen", "official"], {
      errorMap: () => ({ message: "Role must be either 'citizen' or 'official'" }),
    }).default("citizen"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address format"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  })
  .strict();

export const logoutSchema = z
  .object({
    refreshToken: z.string().optional(),
  })
  .strict();

export default { registerSchema, loginSchema, refreshSchema, logoutSchema };
