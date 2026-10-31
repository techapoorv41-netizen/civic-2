const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, list } = require('../../../shared/response/apiResponse');
const service = require('../services/admin.service');
const { toUserDto } = require('../../users/mappers/user.mapper');

exports.block = asyncHandler(async (req, res) =>
  ok(res, toUserDto(await service.blockUser(req.user, req.params.id, req.body.reason)))
);
exports.unblock = asyncHandler(async (req, res) =>
  ok(res, toUserDto(await service.unblockUser(req.user, req.params.id)))
);
exports.actions = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listActions(req.query);
  list(
    res,
    items.map((a) => ({
      id: String(a._id),
      actor: a.actorId && a.actorId.name ? { id: String(a.actorId._id), name: a.actorId.name } : String(a.actorId),
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      metadata: a.metadata,
      createdAt: a.createdAt,
    })),
    meta
  );
});
exports.stats = asyncHandler(async (req, res) => ok(res, await service.stats()));