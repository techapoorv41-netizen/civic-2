const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const idParams = z.object({ id: objectId });

// PATCH /users/me: सिर्फ name और phone, बाकी कुछ भी भेजा तो 422
const updateMe = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, 'Invalid phone').optional(),
  })
  .strict()
  .refine((v) => v.name !== undefined || v.phone !== undefined, {
    message: 'name या phone में से कुछ तो भेजो',
  });

// GET /users (admin)
const listQuery = z.object({
  role: z.enum(['citizen', 'official', 'admin']).optional(),
  isBlocked: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  search: z.string().trim().max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

module.exports = { idParams, updateMe, listQuery };