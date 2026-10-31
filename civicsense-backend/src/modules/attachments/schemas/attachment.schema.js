const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const issueIdParams = z.object({ issueId: objectId });
const issueAndIdParams = z.object({ issueId: objectId, id: objectId });

module.exports = { issueIdParams, issueAndIdParams };