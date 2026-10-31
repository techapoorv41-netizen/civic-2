const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../shared/errors/AppError');
const asyncHandler = require('./asyncHandler');
const User = require('../modules/users/entities/user.entity');

const authenticate = asyncHandler(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Login required');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('role isBlocked');
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  if (user.isBlocked) throw new AppError(403, 'USER_BLOCKED', 'Account is blocked');

  req.user = { id: user.id, role: user.role };
  next();
});

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : next(new AppError(403, 'FORBIDDEN', 'Not allowed'));

module.exports = { authenticate, authorize };