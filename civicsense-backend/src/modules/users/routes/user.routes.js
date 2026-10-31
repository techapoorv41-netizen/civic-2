const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validateModule = require('../../../middleware/validate');
const validate = validateModule.validate || validateModule;
const s = require('../schemas/user.schema');
const c = require('../controllers/user.controller');

router.use(authenticate);

router.get('/users', authorize('admin'), validate({ query: s.listQuery }), c.list);
router.patch('/users/me', validate({ body: s.updateMe }), c.updateMe);
router.get('/users/:id', validate({ params: s.idParams }), c.getById);

module.exports = router;