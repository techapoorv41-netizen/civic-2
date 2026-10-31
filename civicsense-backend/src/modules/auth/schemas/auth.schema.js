const { z } = require('zod');

const register = z
  .object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/, 'Password me number chahiye'),
    phone: z.string().regex(/^[0-9+\-\s]{8,15}$/),
    role: z.enum(['citizen', 'official']),
  })
  .strict();

const login = z
  .object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) })
  .strict();

const tokenBody = z.object({ refreshToken: z.string().min(10) }).strict();

module.exports = { register, login, tokenBody };