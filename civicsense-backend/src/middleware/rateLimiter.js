const rateLimit = require('express-rate-limit');

const tooMany = (req, res) =>
  res.status(429).json({
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, try later' },
  });

const make = (windowMs, max, extra = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooMany,
    ...extra,
  });

module.exports = {
  general: make(15 * 60e3, 300),
  auth: make(15 * 60e3, 10),
  ai: make(60e3, 10, { keyGenerator: (req) => (req.user ? req.user.id : 'anonymous') }),
};