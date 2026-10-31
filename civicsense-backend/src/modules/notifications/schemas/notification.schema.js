const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const idParams = z.object({ id: objectId });
const listQuery = z.object({
  isRead: z.enum(['true', 'false']).optional(),
  type: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { idParams, listQuery };