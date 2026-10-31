const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const s = require('../schemas/assignment.schema');
const c = require('../controllers/assignment.controller');

router.use(authenticate);

router.post(
  '/issues/:issueId/assign',
  authorize('admin'),
  validate({ params: s.issueIdParams, body: s.assign }),
  c.assign
);
router.get('/assignments/mine', authorize('official'), validate({ query: s.mineQuery }), c.mine);
router.patch('/assignments/:id/accept', authorize('official'), validate({ params: s.idParams }), c.accept);
router.patch(
  '/assignments/:id/complete',
  authorize('official'),
  validate({ params: s.idParams, body: s.complete }),
  c.complete
);
router.patch(
  '/assignments/:id/reject',
  authorize('official'),
  validate({ params: s.idParams, body: s.reject }),
  c.reject
);

module.exports = router;