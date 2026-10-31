const toAnalysisDto = (a) =>
  a && {
    id: String(a._id || a.id),
    issueId: String(a.issueId),
    severityScore: a.severityScore,
    predictedCategory: a.predictedCategory,
    duplicateIssueIds: (a.duplicateIssueIds || []).map(String),
    reasoning: a.reasoning,
    model: a.model,
    isMock: a.isMock,
    createdAt: a.createdAt,
  };

const toResponseDto = (r) => ({
  id: String(r._id || r.id),
  prompt: r.prompt,
  response: r.response,
  isMock: r.isMock,
  createdAt: r.createdAt,
});

module.exports = { toAnalysisDto, toResponseDto };