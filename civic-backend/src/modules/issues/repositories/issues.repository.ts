import Issue, { IIssue } from "../entities/Issue.entity";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class IssuesRepository {
  static async create(data: Partial<IIssue>): Promise<IIssue> {
    return await Issue.create(data);
  }

  static async findById(id: Types.ObjectId | string): Promise<IIssue | null> {
    return await Issue.findOne({ _id: id, isDeleted: false })
      .populate("reportedBy", "name email phone role")
      .populate("assignedTo", "name email phone role")
      .populate("category", "name slug");
  }

  static async findByIdRaw(id: Types.ObjectId | string): Promise<IIssue | null> {
    return await Issue.findOne({ _id: id, isDeleted: false });
  }

  static async updateById(
    id: Types.ObjectId | string,
    update: UpdateQuery<IIssue>
  ): Promise<IIssue | null> {
    return await Issue.findOneAndUpdate({ _id: id, isDeleted: false }, update, {
      new: true,
      runValidators: true,
    })
      .populate("reportedBy", "name email phone role")
      .populate("assignedTo", "name email phone role")
      .populate("category", "name slug");
  }

  static async list(
    filter: FilterQuery<IIssue>,
    { skip, limit, sort }: { skip: number; limit: number; sort: any }
  ) {
    const [items, total] = await Promise.all([
      Issue.find(filter)
        .populate("reportedBy", "name email phone role")
        .populate("assignedTo", "name email phone role")
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Issue.countDocuments(filter),
    ]);
    return { items, total };
  }

  static async count(filter: FilterQuery<IIssue> = {}): Promise<number> {
    return await Issue.countDocuments(filter);
  }

  static async softDelete(id: Types.ObjectId | string): Promise<IIssue | null> {
    return await Issue.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }
}

export default IssuesRepository;
