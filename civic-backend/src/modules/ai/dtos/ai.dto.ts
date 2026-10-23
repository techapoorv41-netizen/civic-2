import { PaginationMeta } from "../../../shared/utils/pagination";

export interface SendBotPromptDTO {
  prompt: string;
}

export interface AIAnalysisDTO {
  id: string;
  issueId: string;
  severityScore: number;
  predictedCategory: string | null;
  duplicateIssueIds: string[];
  reasoning: string | null;
  model: string;
  isMock: boolean;
  summary: string | null;
  suggestedDepartment: string;
  suggestedPriority: string;
  confidenceScore: number;
  isDuplicate: boolean;
  createdAt: string | null;
}

export interface AIResponseDTO {
  id: string;
  issueId: string;
  userId: string;
  prompt: string;
  response: string;
  model: string;
  isMock: boolean;
  responseType: string;
  createdAt: string | null;
}

export interface PaginatedAIResponsesDTO {
  responses: AIResponseDTO[];
  meta: PaginationMeta;
}
