const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const upload = require('../../../middleware/upload');
const s = require('../schemas/attachment.schema');
const c = require('../controllers/attachment.controller');

router.use(authenticate);

router.post(
  '/issues/:issueId/attachments',
  authorize('citizen', 'admin'),
  validate({ params: s.issueIdParams }),
  upload, // multer: field नाम 'file'
  c.add
);
router.get('/issues/:issueId/attachments', validate({ params: s.issueIdParams }), c.list);
router.delete(
  '/issues/:issueId/attachments/:id',
  validate({ params: s.issueAndIdParams }),
  c.remove
);

module.exports = router;