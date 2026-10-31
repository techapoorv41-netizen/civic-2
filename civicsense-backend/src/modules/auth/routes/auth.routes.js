const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const rateLimiter = require('../../../middleware/rateLimiter');
const s = require('../schemas/auth.schema');
const c = require('../controllers/auth.controller');

router.post('/auth/register', rateLimiter.auth, validate({ body: s.register }), c.register);
router.post('/auth/login', rateLimiter.auth, validate({ body: s.login }), c.login);
router.post('/auth/refresh', rateLimiter.auth, validate({ body: s.tokenBody }), c.refresh);
router.post('/auth/logout', authenticate, validate({ body: s.tokenBody }), c.logout);
router.get('/auth/me', authenticate, c.me);

module.exports = router;