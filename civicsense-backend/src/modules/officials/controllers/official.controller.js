const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, created, list } = require('../../../shared/response/apiResponse');
const service = require('../services/official.service');
const { toOfficialDto } = require('../mappers/official.mapper');

exports.create = asyncHandler(async (req, res) =>
  created(res, toOfficialDto(await service.createProfile(req.user, req.body)))
);
exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  list(res, items.map(toOfficialDto), meta);
});
exports.get = asyncHandler(async (req, res) =>
  ok(res, toOfficialDto(await service.getById(req.user, req.params.id)))
);
exports.verify = asyncHandler(async (req, res) =>
  ok(res, toOfficialDto(await service.verify(req.user, req.params.id)))
);