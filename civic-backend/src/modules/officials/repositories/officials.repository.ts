import OfficialProfile, { IOfficialProfile } from "../entities/OfficialProfile.entity";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class OfficialsRepository {
  static async findById(id: Types.ObjectId | string): Promise<IOfficialProfile | null> {
    return await OfficialProfile.findById(id).populate("userId", "name email phone role");
  }

  static async findByUserId(userId: Types.ObjectId | string): Promise<IOfficialProfile | null> {
    return await OfficialProfile.findOne({ userId });
  }

  static async findByEmployeeId(employeeId: string): Promise<IOfficialProfile | null> {
    return await OfficialProfile.findOne({ employeeId: employeeId.trim() });
  }

  static async create(data: Partial<IOfficialProfile>): Promise<IOfficialProfile> {
    return await OfficialProfile.create(data);
  }

  static async updateById(
    id: Types.ObjectId | string,
    update: UpdateQuery<IOfficialProfile>
  ): Promise<IOfficialProfile | null> {
    return await OfficialProfile.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  static async list(
    filter: FilterQuery<IOfficialProfile>,
    { skip, limit, sort }: { skip: number; limit: number; sort: any }
  ) {
    const [items, total] = await Promise.all([
      OfficialProfile.find(filter)
        .populate("userId", "name email phone role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      OfficialProfile.countDocuments(filter),
    ]);
    return { items, total };
  }

  static async count(filter: FilterQuery<IOfficialProfile> = {}): Promise<number> {
    return await OfficialProfile.countDocuments(filter);
  }
}

export default OfficialsRepository;
