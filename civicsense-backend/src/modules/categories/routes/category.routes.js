const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/category.schema');
const c = require('../controllers/category.controller');

router.use(authenticate);
router.get('/categories', c.list);
router.post('/categories', authorize('admin'), validate({ body: s.create }), c.create);

module.exports = router;