const asyncHandler = require('../../../middleware/asyncHandler');
const { created, ok, list } = require('../../../shared/response/apiResponse');
const service = require('../services/ai.service');
const { toAnalysisDto, toResponseDto } = require('../mappers/ai.mapper');

exports.analyze = asyncHandler(async (req, res) =>
  created(res, toAnalysisDto(await service.generateAnalysis(req.user, req.params.issueId)))
);

exports.getAnalysis = asyncHandler(async (req, res) =>
  ok(res, toAnalysisDto(await service.getAnalysis(req.user, req.params.issueId)) || null)
);

exports.ask = asyncHandler(async (req, res) =>
  created(res, toResponseDto(await service.askBot(req.user, req.params.issueId, req.body.prompt)))
);

exports.history = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listBotHistory(req.user, req.params.issueId, req.query);
  list(res, items.map(toResponseDto), meta);
});