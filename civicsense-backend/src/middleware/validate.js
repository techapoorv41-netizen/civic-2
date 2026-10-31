const AppError = require('../shared/errors/AppError');
module.exports = (schemas) => (req, res, next) => {
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const r = schemas[key].safeParse(req[key]);
    if (!r.success) {
      const details = r.error.issues.map((i) => ({
        path: i.path.map(String).join('.'),
        message: i.message,
      }));
      return next(new AppError(422, 'VALIDATION_ERROR', 'Invalid input', details));
    }
    req[key] = r.data; // cleaned + defaults applied
  }
  next();
};
