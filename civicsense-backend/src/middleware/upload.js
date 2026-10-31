const multer = require('multer');
const env = require('../config/env');
const AppError = require('../shared/errors/AppError');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const single = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError(422, 'VALIDATION_ERROR', 'Only jpeg, png, webp allowed')),
}).single('file'); // field name 'file' (D13)

// Multer ke apne errors ko AppError (422) me badalta hai
module.exports = (req, res, next) =>
  single(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? `File too large (max ${env.UPLOAD_MAX_MB} MB)`
          : "Send exactly one file in field named 'file'";
      return next(new AppError(422, 'VALIDATION_ERROR', msg));
    }
    next(err);
  });

module.exports.ALLOWED_MIME = ALLOWED;