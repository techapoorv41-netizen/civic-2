const asyncHandler = require('../../../middleware/asyncHandler');
const { created, list } = require('../../../shared/response/apiResponse');
const service = require('../services/comment.service');
const { toCommentDto } = require('../mappers/comment.mapper');

exports.create = asyncHandler(async (req, res) =>
  created(res, toCommentDto(await service.addComment(req.user, req.params.issueId, req.body)))
);
exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listComments(req.user, req.params.issueId, req.query);
  list(res, items.map(toCommentDto), meta);
});