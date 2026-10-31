const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const idParams = z.object({ id: objectId });
const block = z.object({ reason: z.string().trim().min(3).max(200) }).strict();
const actionsQuery = z.object({
  action: z.string().optional(),
  actorId: objectId.optional(),
  targetType: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { idParams, block, actionsQuery };