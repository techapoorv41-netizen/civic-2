const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, list } = require('../../../shared/response/apiResponse');
const service = require('../services/notification.service');
const { toNotificationDto } = require('../mappers/notification.mapper');

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listMine(req.user, req.query);
  list(res, items.map(toNotificationDto), meta);
});
exports.markRead = asyncHandler(async (req, res) =>
  ok(res, toNotificationDto(await service.markRead(req.user, req.params.id)))
);
exports.readAll = asyncHandler(async (req, res) => ok(res, await service.readAll(req.user)));