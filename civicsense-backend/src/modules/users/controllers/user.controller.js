const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, list: sendList } = require('../../../shared/response/apiResponse');
const profileService = require('../services/userProfile.service');

exports.getById = asyncHandler(async (req, res) =>
  ok(res, await profileService.getById(req.user, req.params.id))
);

exports.updateMe = asyncHandler(async (req, res) =>
  ok(res, await profileService.updateMe(req.user, req.body))
);

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await profileService.listUsers(req.query);
  sendList(res, items, meta);
});