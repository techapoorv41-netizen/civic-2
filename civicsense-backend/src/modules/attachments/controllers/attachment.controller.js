const asyncHandler = require('../../../middleware/asyncHandler');
const { created, ok } = require('../../../shared/response/apiResponse');
const service = require('../services/attachment.service');
const { toAttachmentDto } = require('../mappers/attachment.mapper');

exports.add = asyncHandler(async (req, res) =>
  created(res, toAttachmentDto(await service.addAttachment(req.user, req.params.issueId, req.file)))
);

exports.list = asyncHandler(async (req, res) => {
  const items = await service.listAttachments(req.user, req.params.issueId);
  ok(res, items.map(toAttachmentDto));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.removeAttachment(req.user, req.params.issueId, req.params.id);
  ok(res, { deleted: true });
});