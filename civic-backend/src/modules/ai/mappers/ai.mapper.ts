import { AIAnalysisDTO, AIResponseDTO } from "../dtos/ai.dto";

export const toAIAnalysisDTO = (analysis: any): AIAnalysisDTO | null => {
  if (!analysis) return null;
  const raw = analysis && analysis.toObject ? analysis.toObject() : { ...analysis };

  return {
    id: (raw._id || raw.id).toString(),
    issueId: (raw.issueId?._id || raw.issueId)?.toString(),
    severityScore: Number(raw.severityScore) || 5,
    predictedCategory: raw.predictedCategory || null,
    duplicateIssueIds: Array.isArray(raw.duplicateIssueIds) ? raw.duplicateIssueIds : [],
    reasoning: raw.reasoning || null,
    model: raw.model || "mock",
    isMock: Boolean(raw.isMock),
    summary: raw.summary || raw.reasoning || null,
    suggestedDepartment: raw.suggestedDepartment || "Public Works Department",
    suggestedPriority: raw.suggestedPriority || (raw.severityScore >= 8 ? "high" : raw.severityScore >= 5 ? "medium" : "low"),
    confidenceScore: raw.confidenceScore !== undefined ? raw.confidenceScore : 0.88,
    isDuplicate: Boolean(raw.isDuplicate || (raw.duplicateIssueIds && raw.duplicateIssueIds.length > 0)),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export const toAIResponseDTO = (resp: any): AIResponseDTO => {
  const raw = resp && resp.toObject ? resp.toObject() : { ...resp };

  return {
    id: (raw._id || raw.id).toString(),
    issueId: (raw.issueId?._id || raw.issueId)?.toString(),
    userId: (raw.userId?._id || raw.userId)?.toString(),
    prompt: raw.prompt,
    response: raw.response,
    model: raw.model || "mock",
    isMock: Boolean(raw.isMock),
    responseType: raw.responseType || "report_assistance",
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export default { toAIAnalysisDTO, toAIResponseDTO };
