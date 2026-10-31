const { z } = require('zod');
const { ISSUE_STATUSES, PRIORITIES } = require('../../../shared/constants/issueStatus');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const idParams = z.object({ id: objectId });
const issueIdParams = z.object({ issueId: objectId });

const location = z.object({
  address: z.string().trim().min(3).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const create = z
  .object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(10).max(2000),
    categoryId: objectId,
    priority: z.enum(PRIORITIES).optional(),
    location,
  })
  .strict();


const update = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    categoryId: objectId.optional(),
    location: location.optional(),
    priority: z.enum(PRIORITIES).optional(),
    remarks: z.string().trim().max(500).optional(),
    status: z.enum(ISSUE_STATUSES).optional(),
  })
  .strict();

const verify = z.object({ remarks: z.string().trim().max(500).optional() }).strict();

const listQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: objectId.optional(),
  search: z.string().trim().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  assignedTo: z.union([z.literal('me'), objectId]).optional(),
});

module.exports = { idParams, issueIdParams, create, update, verify, listQuery };