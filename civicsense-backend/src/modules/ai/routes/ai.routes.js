const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const limiter = require('../../../middleware/rateLimiter');
const s = require('../schemas/ai.schema');
const c = require('../controllers/ai.controller');

router.use(authenticate);

router.post('/issues/:issueId/ai-analysis', limiter.ai, validate({ params: s.issueIdParams }), c.analyze);
router.get('/issues/:issueId/ai-analysis', validate({ params: s.issueIdParams }), c.getAnalysis);
router.post(
  '/issues/:issueId/ai-responses',
  limiter.ai,
  validate({ params: s.issueIdParams, body: s.prompt }),
  c.ask
);
router.get(
  '/issues/:issueId/ai-responses',
  validate({ params: s.issueIdParams, query: s.historyQuery }),
  c.history
);

module.exports = router;