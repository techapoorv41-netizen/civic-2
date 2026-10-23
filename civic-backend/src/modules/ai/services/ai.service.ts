import env from "../../../config/env";
import AIRepository from "../repositories/ai.repository";
import IssuesRepository from "../../issues/repositories/issues.repository";
import CategoriesRepository from "../../categories/repositories/categories.repository";
import AppError from "../../../errors/AppError";
import { logger } from "../../../shared/utils/logger";
import { parsePagination, buildPaginationMeta } from "../../../shared/utils/pagination";
import { toAIAnalysisDTO, toAIResponseDTO } from "../mappers/ai.mapper";
import { AiProvider } from "./providers/AiProvider";
import { MockProvider } from "./providers/MockProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { AnthropicProvider } from "./providers/AnthropicProvider";
import { AIAnalysisDTO, AIResponseDTO } from "../dtos/ai.dto";
import Issue from "../../issues/entities/Issue.entity";

export class AIService {
  private static getProvider(): AiProvider {
    if (env.AI_MODE === "mock" || process.env.NODE_ENV === "test") {
      return new MockProvider();
    }
    if (env.AI_PROVIDER === "anthropic") {
      return new AnthropicProvider();
    }
    return new GeminiProvider();
  }

  static async findDuplicateCandidates(issue: any): Promise<any[]> {
    const filter: any = {
      _id: { $ne: issue._id },
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - 30 * 864e5) },
    };

    if (issue.category) {
      filter.category = issue.category;
    }

    if (issue.location?.point?.coordinates) {
      filter["location.point"] = {
        $near: {
          $geometry: issue.location.point,
          $maxDistance: 200,
        },
      };
    }

    try {
      return await Issue.find(filter).limit(5).select("_id title").lean();
    } catch {
      return [];
    }
  }

  static async generateAnalysis({
    issueId,
    userId,
  }: {
    issueId: string;
    userId: string;
  }): Promise<AIAnalysisDTO> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const categories = (await CategoriesRepository.list({ isActive: true })).map((c: any) => c.name);
    const candidates = await this.findDuplicateCandidates(issue);
    const candidateList = candidates.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
    }));

    const provider = this.getProvider();
    let rawOutput: any;

    try {
      rawOutput = await provider.analyzeIssue({
        title: issue.title,
        description: issue.description,
        categories,
        candidates: candidateList,
      });
    } catch (e: any) {
      logger.error({ err: e.message }, "AI provider analysis failed");
      throw new AppError(503, "AI_UNAVAILABLE", "AI service is temporarily unavailable");
    }

    const validCandidateIds = new Set(candidateList.map((c) => c.id));
    const safeDuplicateIds = (rawOutput.duplicateIssueIds || []).filter((id: string) =>
      validCandidateIds.has(id)
    );

    const isDuplicate = safeDuplicateIds.length > 0;
    const severityScore = Number(rawOutput.severityScore) || 5;
    const suggestedPriority = severityScore >= 8 ? "high" : severityScore >= 5 ? "medium" : "low";

    const analysis = await AIRepository.createAnalysis({
      issueId: issue._id,
      requestedBy: userId as any,
      severityScore,
      predictedCategory: rawOutput.predictedCategory || null,
      duplicateIssueIds: safeDuplicateIds,
      reasoning: rawOutput.reasoning || null,
      model: env.AI_MODE === "mock" || process.env.NODE_ENV === "test" ? "mock" : env.AI_MODEL || "live",
      isMock: Boolean(rawOutput._mock),
      summary: rawOutput.reasoning || null,
      suggestedDepartment: "Public Works Department",
      suggestedPriority,
      confidenceScore: 0.88,
      isDuplicate,
    });

    return toAIAnalysisDTO(analysis)!;
  }

  static async getAnalysis(issueId: string): Promise<AIAnalysisDTO | null> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const analysis = await AIRepository.findLatestAnalysisByIssueId(issueId);
    return toAIAnalysisDTO(analysis);
  }

  static async sendBotPrompt({
    issueId,
    userId,
    prompt,
  }: {
    issueId: string;
    userId: string;
    prompt: string;
  }): Promise<AIResponseDTO> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const { items: history } = await AIRepository.listResponsesByIssueAndUser(issueId, userId, {
      skip: 0,
      limit: 10,
    });

    const provider = this.getProvider();
    let replyText: string;

    try {
      replyText = await provider.chat({
        prompt: prompt.trim(),
        issueContext: {
          title: issue.title,
          status: issue.status,
          category: issue.categoryName || "General",
          locationAddress: issue.locationAddress,
          description: issue.description,
          assignedTo: issue.assignedTo,
        },
        history: history.map((h: any) => ({ prompt: h.prompt, response: h.response })),
      });
    } catch (e: any) {
      logger.error({ err: e.message }, "AI bot chat failed");
      throw new AppError(503, "AI_UNAVAILABLE", "AI service is temporarily unavailable");
    }

    const isMock = env.AI_MODE === "mock" || process.env.NODE_ENV === "test";
    const responseRecord = await AIRepository.createResponse({
      issueId: issue._id,
      userId: userId as any,
      prompt: prompt.trim(),
      response: replyText.trim(),
      model: isMock ? "mock" : env.AI_MODEL || "live",
      isMock,
      responseType: "report_assistance",
    });

    return toAIResponseDTO(responseRecord);
  }

  static async getBotHistory({
    issueId,
    userId,
    query = {},
  }: {
    issueId: string;
    userId?: string;
    query?: any;
  }): Promise<{ items: AIResponseDTO[]; meta: any }> {
    const issue = await IssuesRepository.findByIdRaw(issueId);
    if (!issue) {
      throw AppError.notFound("Issue not found");
    }

    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await AIRepository.listResponsesByIssueAndUser(issueId, userId, {
      skip,
      limit,
    });

    const responses = items.map((r: any) => toAIResponseDTO(r));
    const meta = buildPaginationMeta(total, page, limit);

    return {
      items: responses,
      meta,
    };
  }
}

export default AIService;
