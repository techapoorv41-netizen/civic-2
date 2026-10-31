const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

// params
const idParams = z.object({ id: objectId });
const issueIdParams = z.object({ issueId: objectId });

// POST /issues/:issueId/assign (officialId = User id, D12)
const assign = z
  .object({
    officialId: objectId,
    dueDate: z.coerce.date().optional(),
    remarks: z.string().trim().max(500).optional(),
  })
  .strict();

// PATCH /assignments/:id/complete
const complete = z
  .object({
    remarks: z.string().trim().min(5).max(500),
  })
  .strict();

// PATCH /assignments/:id/reject
const reject = z
  .object({
    reason: z.string().trim().min(3).max(500),
  })
  .strict();

// GET /assignments/mine
const mineQuery = z.object({
  status: z.enum(['assigned', 'accepted', 'rejected', 'completed']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

module.exports = { idParams, issueIdParams, assign, complete, reject, mineQuery };