import IssueAttachment, { IIssueAttachment } from "../entities/Attachment.entity";
import { Types } from "mongoose";

export class AttachmentsRepository {
  static async create(data: Partial<IIssueAttachment>): Promise<IIssueAttachment> {
    return await IssueAttachment.create(data);
  }

  static async findById(id: Types.ObjectId | string): Promise<IIssueAttachment | null> {
    return await IssueAttachment.findById(id);
  }

  static async countByIssueId(issueId: Types.ObjectId | string): Promise<number> {
    return await IssueAttachment.countDocuments({ issueId });
  }

  static async listByIssueId(issueId: Types.ObjectId | string) {
    return await IssueAttachment.find({ issueId }).sort({ createdAt: 1 }).lean();
  }

  static async deleteById(id: Types.ObjectId | string): Promise<IIssueAttachment | null> {
    return await IssueAttachment.findByIdAndDelete(id);
  }
}

export default AttachmentsRepository;
