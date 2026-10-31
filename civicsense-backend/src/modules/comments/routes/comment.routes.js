const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/comment.schema');
const c = require('../controllers/comment.controller');

router.use(authenticate);
router.post('/issues/:issueId/comments', validate({ params: s.issueParams, body: s.create }), c.create);
router.get('/issues/:issueId/comments', validate({ params: s.issueParams, query: s.listQuery }), c.list);

module.exports = router;