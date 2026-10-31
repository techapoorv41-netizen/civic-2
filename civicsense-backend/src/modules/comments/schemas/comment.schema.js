const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const issueParams = z.object({ issueId: objectId });
const create = z.object({ message: z.string().trim().min(1).max(1000) }).strict();
const listQuery = z.object({ page: z.string().optional(), limit: z.string().optional() });

module.exports = { issueParams, create, listQuery };