import IssueStatusHistory, { IIssueStatusHistory } from "../entities/IssueHistory.entity";
import { Types } from "mongoose";

export class IssueHistoryRepository {
  static async create(data: {
    issueId: Types.ObjectId | string;
    oldStatus?: string | null;
    previousStatus?: string | null;
    newStatus: string;
    changedBy: Types.ObjectId | string;
    actorId?: Types.ObjectId | string;
    remarks?: string | null;
  }): Promise<IIssueStatusHistory> {
    return await IssueStatusHistory.create(data);
  }

  static async listByIssueId(issueId: Types.ObjectId | string) {
    return await IssueStatusHistory.find({ issueId })
      .populate("changedBy", "name email role")
      .populate("actorId", "name email role")
      .sort({ createdAt: 1 })
      .lean();
  }
}

export default IssueHistoryRepository;
