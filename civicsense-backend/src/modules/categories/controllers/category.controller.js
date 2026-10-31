const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, created } = require('../../../shared/response/apiResponse');
const service = require('../services/category.service');
const { toCategoryDto } = require('../mappers/category.mapper');

exports.list = asyncHandler(async (req, res) => {
  const items = await service.listActive();
  ok(res, items.map(toCategoryDto));
});

exports.create = asyncHandler(async (req, res) => {
  const c = await service.createCategory(req.user, req.body);
  created(res, toCategoryDto(c));
});