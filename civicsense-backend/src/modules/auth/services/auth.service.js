const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../../../config/env');
const AppError = require('../../../shared/errors/AppError');
const userRepo = require('../../users/repositories/user.repository');
const tokenRepo = require('../repositories/refreshToken.repository');
const { toUserDto } = require('../../users/mappers/user.mapper');

const hashToken = (t) =>
  crypto.createHmac('sha256', env.REFRESH_TOKEN_SECRET).update(String(t)).digest('hex');

async function issueTokens(user, userAgent) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await tokenRepo.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 864e5),
  });
  return { accessToken, refreshToken };
}

async function register({ name, email, password, phone, role }, userAgent) {
  if (await userRepo.findByEmail(email)) {
    throw new AppError(409, 'CONFLICT', 'Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.create({ name, email, phone, role, passwordHash });
  const tokens = await issueTokens(user, userAgent);
  return { user: toUserDto(user), ...tokens };
}

async function login({ email, password }, userAgent) {
  const user = await userRepo.findByEmailWithHash(email);
  const okPass = user && (await bcrypt.compare(password, user.passwordHash));
  if (!okPass) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is wrong');
  }
  if (user.isBlocked) {
    throw new AppError(403, 'USER_BLOCKED', 'Account is blocked');
  }
  const tokens = await issueTokens(user, userAgent);
  return { user: toUserDto(user), ...tokens };
}

async function refresh(token, userAgent) {
  if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  const doc = await tokenRepo.findByHash(hashToken(token));
  if (!doc) throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  if (doc.revokedAt) {
    await tokenRepo.revokeAllForUser(doc.userId);
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token reused');
  }
  if (doc.expiresAt < new Date()) {
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token expired');
  }
  await tokenRepo.revoke(doc.id);
  const user = await userRepo.findById(doc.userId);
  if (!user || user.isBlocked) {
    throw new AppError(401, 'UNAUTHORIZED', 'User unavailable');
  }
  return issueTokens(user, userAgent);
}

async function logout(token) {
  if (!token) return;
  const doc = await tokenRepo.findByHash(hashToken(token));
  if (doc) await tokenRepo.revoke(doc.id);
}

async function me(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return toUserDto(user);
}
module.exports = { register, login, refresh, logout, me };