const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const idParams = z.object({ id: objectId });
const create = z
  .object({
    department: z.string().trim().min(2).max(80),
    designation: z.string().trim().min(2).max(80),
    employeeId: z.string().trim().min(2).max(40),
    area: z.string().trim().max(100).optional(),
  })
  .strict();
const listQuery = z.object({
  isVerified: z.enum(['true', 'false']).optional(),
  department: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { idParams, create, listQuery };