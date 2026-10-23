import { z } from "zod";

export const getNotificationsQuerySchema = z.object({
  isRead: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  type: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

export default { getNotificationsQuerySchema, notificationIdParamSchema };
