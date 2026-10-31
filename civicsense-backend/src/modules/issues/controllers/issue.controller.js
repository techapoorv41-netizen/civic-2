const asyncHandler = require('../../../middleware/asyncHandler');
const { created, ok, list } = require('../../../shared/response/apiResponse');
const service = require('../services/issue.service');
const { toIssueDto, toHistoryDto } = require('../mappers/issue.mapper');

exports.create = asyncHandler(async (req, res) =>
  created(res, toIssueDto(await service.createIssue(req.user, req.body)))
);

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listIssues(req.user, req.query);
  list(res, items.map(toIssueDto), meta);
});

exports.get = asyncHandler(async (req, res) =>
  ok(res, toIssueDto(await service.getIssueDetail(req.user, req.params.id)))
);

exports.update = asyncHandler(async (req, res) =>
  ok(res, toIssueDto(await service.updateIssue(req.user, req.params.id, req.body)))
);

exports.remove = asyncHandler(async (req, res) => {
  await service.deleteIssue(req.user, req.params.id);
  ok(res, { deleted: true });
});

exports.verify = asyncHandler(async (req, res) =>
  ok(res, toIssueDto(await service.verifyIssue(req.user, req.params.id, req.body.remarks)))
);

exports.history = asyncHandler(async (req, res) => {
  const items = await service.getHistory(req.user, req.params.issueId);
  ok(res, items.map(toHistoryDto));
});