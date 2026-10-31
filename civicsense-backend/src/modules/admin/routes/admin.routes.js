const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/admin.schema');
const c = require('../controllers/admin.controller');

router.use(authenticate);
router.patch('/admin/users/:id/block', authorize('admin'), validate({ params: s.idParams, body: s.block }), c.block);
router.patch('/admin/users/:id/unblock', authorize('admin'), validate({ params: s.idParams }), c.unblock);
router.get('/admin/actions', authorize('admin'), validate({ query: s.actionsQuery }), c.actions);
router.get('/admin/stats', authorize('admin'), c.stats);

module.exports = router;