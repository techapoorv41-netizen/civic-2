const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/issue.schema');
const c = require('../controllers/issue.controller');

router.use(authenticate);

router.post('/issues', authorize('citizen', 'admin'), validate({ body: s.create }), c.create);
router.get('/issues', validate({ query: s.listQuery }), c.list);
router.get('/issues/:id', validate({ params: s.idParams }), c.get);
router.patch('/issues/:id/verify', authorize('admin'), validate({ params: s.idParams, body: s.verify }), c.verify);
router.patch('/issues/:id', validate({ params: s.idParams, body: s.update }), c.update);
router.delete('/issues/:id', validate({ params: s.idParams }), c.remove);
router.get('/issues/:issueId/history', validate({ params: s.issueIdParams }), c.history);

module.exports = router;