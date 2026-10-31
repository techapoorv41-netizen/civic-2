const asyncHandler = require('../../../middleware/asyncHandler');
const { ok, created, list } = require('../../../shared/response/apiResponse');
const service = require('../services/assignment.service');
const { toAssignmentDto } = require('../mappers/assignment.mapper');

exports.assign = asyncHandler(async (req, res) => {
  const a = await service.assign(req.user, req.params.issueId, req.body);
  created(res, toAssignmentDto(a));
});

exports.listMine = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listMine(req.user, req.query);
  list(res, items.map(toAssignmentDto), meta);
});
exports.mine = exports.listMine;

exports.accept = asyncHandler(async (req, res) => {
  const a = await service.accept(req.user, req.params.id);
  ok(res, toAssignmentDto(a));
});

exports.complete = asyncHandler(async (req, res) => {
  const a = await service.complete(req.user, req.params.id, req.body.remarks);
  ok(res, toAssignmentDto(a));
});

exports.reject = asyncHandler(async (req, res) => {
  const a = await service.reject(req.user, req.params.id, req.body.reason);
  ok(res, toAssignmentDto(a));
});