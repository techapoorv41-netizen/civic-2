const logger = require('../shared/logger');

module.exports = (err, req, res, next) => {
  let { status, code, message } = err;

  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'File too large';
  } else if (err.name === 'CastError') {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'Invalid id';
  } else if (!err.isOperational) {
    status = 500;
    code = 'INTERNAL_ERROR';
    message = 'Something went wrong';
  }

  if (status >= 500) logger.error({ err }, 'unhandled error');

  res.status(status || 500).json({
    success: false,
    error: { code, message, details: err.details },
  });
};