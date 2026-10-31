const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/notification.schema');
const c = require('../controllers/notification.controller');

router.use(authenticate);
router.get('/notifications', validate({ query: s.listQuery }), c.list);
router.patch('/notifications/read-all', c.readAll);
router.patch('/notifications/:id/read', validate({ params: s.idParams }), c.markRead);

module.exports = router;