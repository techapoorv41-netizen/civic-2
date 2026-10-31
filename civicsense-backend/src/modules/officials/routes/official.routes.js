const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/official.schema');
const c = require('../controllers/official.controller');

router.use(authenticate);
router.post('/officials', authorize('official'), validate({ body: s.create }), c.create);
router.get('/officials', authorize('admin'), validate({ query: s.listQuery }), c.list);
router.get('/officials/:id', authorize('admin', 'official'), validate({ params: s.idParams }), c.get);
router.patch('/officials/:id/verify', authorize('admin'), validate({ params: s.idParams }), c.verify);

module.exports = router;