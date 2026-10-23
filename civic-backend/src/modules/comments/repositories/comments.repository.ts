import Comment, { IComment } from "../entities/Comment.entity";
import { FilterQuery, Types } from "mongoose";

export class CommentsRepository {
  static async create(data: Partial<IComment>): Promise<IComment> {
    return await Comment.create(data);
  }

  static async countByIssueId(issueId: Types.ObjectId | string): Promise<number> {
    return await Comment.countDocuments({ issueId });
  }

  static async list(
    filter: FilterQuery<IComment>,
    { skip, limit }: { skip: number; limit: number }
  ) {
    const [items, total] = await Promise.all([
      Comment.find(filter)
        .populate("authorId", "name role")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);
    return { items, total };
  }
}

export default CommentsRepository;
