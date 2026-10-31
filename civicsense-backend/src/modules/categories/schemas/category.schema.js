const { z } = require('zod');

const create = z
  .object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(200).optional(),
    icon: z.string().trim().max(50).optional(),
  })
  .strict();

module.exports = { create };