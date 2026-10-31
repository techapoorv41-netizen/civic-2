const pino = require('pino');

module.exports = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  redact: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.refreshToken',
    '*.apiKey',
    '*.passwordHash',
  ],
});