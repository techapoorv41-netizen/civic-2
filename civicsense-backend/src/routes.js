const router = require('express').Router();

// auth सबसे पहले (public routes हैं, और बाकी routers router.use(authenticate) लगाते हैं)
router.use(require('./modules/auth').router);
router.use(require('./modules/categories').router);
router.use(require('./modules/issues').router);
router.use(require('./modules/assignments').router);
router.use(require('./modules/attachments').router);
router.use(require('./modules/ai').router);
router.use(require('./modules/notifications').router);
router.use(require('./modules/officials').router);
router.use(require('./modules/users').router);
router.use(require('./modules/comments').router);
router.use(require('./modules/admin').router);

module.exports = router;