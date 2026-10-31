const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, created } = require('../../../shared/response/apiResponse');
const service = require('../services/auth.service');
const userService = require('../../users/services/user.service');
const { toUserDto } = require('../../users/mappers/user.mapper');

const ua = (req) => req.headers['user-agent'] || '';

exports.register = asyncHandler(async (req, res) =>
  created(res, await service.register(req.body, ua(req)))
);
exports.login = asyncHandler(async (req, res) => ok(res, await service.login(req.body, ua(req))));
exports.refresh = asyncHandler(async (req, res) =>
  ok(res, await service.refresh(req.body.refreshToken, ua(req)))
);
exports.logout = asyncHandler(async (req, res) => {
  await service.logout(req.body.refreshToken);
  ok(res, { loggedOut: true });
});
exports.me = asyncHandler(async (req, res) => {
  const user = await service.me(req.user.id);
  const dto = {...user};
  if (user.role === 'official') {
    try {
      const p = await require('../../officials/repositories/official.repository').findByUserId(user.id);
      dto.isVerified = !!(p && p.isVerified);
    } catch {
      dto.isVerified = false;
    }
  }
  ok(res, dto);
});