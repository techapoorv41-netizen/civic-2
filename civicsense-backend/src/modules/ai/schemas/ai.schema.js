const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const issueIdParams = z.object({ issueId: objectId });
const prompt = z.object({ prompt: z.string().trim().min(1).max(500) }).strict();
const historyQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = { issueIdParams, prompt, historyQuery };