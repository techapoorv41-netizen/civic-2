export interface AnalyzeIssueInput {
  title: string;
  description: string;
  categories: string[];
  candidates: { id: string; title: string }[];
}

export interface AnalyzeIssueOutput {
  severityScore: number;
  predictedCategory: string | null;
  duplicateIssueIds: string[];
  reasoning: string;
  _mock?: boolean;
}

export interface ChatInput {
  prompt: string;
  issueContext?: Record<string, any>;
  history?: { prompt?: string; response?: string }[];
}

export abstract class AiProvider {
  abstract analyzeIssue(input: AnalyzeIssueInput): Promise<AnalyzeIssueOutput>;
  abstract chat(input: ChatInput): Promise<string>;
}

export default AiProvider;
