import AIAnalysis, { IAIAnalysis } from "../entities/AIAnalysis.entity";
import AIResponse, { IAIResponse } from "../entities/AIResponse.entity";
import { Types } from "mongoose";

export class AIRepository {
  static async createAnalysis(data: Partial<IAIAnalysis>): Promise<IAIAnalysis> {
    return await AIAnalysis.create(data);
  }

  static async findLatestAnalysisByIssueId(issueId: Types.ObjectId | string): Promise<IAIAnalysis | null> {
    return await AIAnalysis.findOne({ issueId }).sort({ createdAt: -1 });
  }

  static async createResponse(data: Partial<IAIResponse>): Promise<IAIResponse> {
    return await AIResponse.create(data);
  }

  static async listResponsesByIssueAndUser(
    issueId: Types.ObjectId | string,
    userId: Types.ObjectId | string | undefined,
    { skip, limit }: { skip: number; limit: number }
  ) {
    const filter: any = { issueId };
    if (userId) {
      filter.userId = userId;
    }
    const [items, total] = await Promise.all([
      AIResponse.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
      AIResponse.countDocuments(filter),
    ]);
    return { items, total };
  }
}

export default AIRepository;
