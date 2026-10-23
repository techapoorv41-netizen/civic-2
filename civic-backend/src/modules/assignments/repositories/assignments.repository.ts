import IssueAssignment, { IIssueAssignment } from "../entities/Assignment.entity";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class AssignmentsRepository {
  static async create(data: Partial<IIssueAssignment>): Promise<IIssueAssignment> {
    return await IssueAssignment.create(data);
  }

  static async findById(id: Types.ObjectId | string): Promise<IIssueAssignment | null> {
    return await IssueAssignment.findById(id)
      .populate("issueId")
      .populate("officialId", "name email role");
  }

  static async findActiveByIssueId(issueId: Types.ObjectId | string): Promise<IIssueAssignment | null> {
    return await IssueAssignment.findOne({ issueId, isActive: true });
  }

  static async findLatestByIssueId(issueId: Types.ObjectId | string): Promise<IIssueAssignment | null> {
    return await IssueAssignment.findOne({ issueId }).sort({ createdAt: -1 });
  }

  static async updateById(
    id: Types.ObjectId | string,
    update: UpdateQuery<IIssueAssignment>
  ): Promise<IIssueAssignment | null> {
    return await IssueAssignment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  static async list(
    filter: FilterQuery<IIssueAssignment>,
    { skip, limit, sort }: { skip: number; limit: number; sort: any }
  ) {
    const [items, total] = await Promise.all([
      IssueAssignment.find(filter)
        .populate("issueId")
        .populate("officialId", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      IssueAssignment.countDocuments(filter),
    ]);
    return { items, total };
  }
}

export default AssignmentsRepository;
