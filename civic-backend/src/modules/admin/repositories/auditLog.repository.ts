import AuditLog, { IAuditLog } from "../entities/AuditLog.entity";
import { FilterQuery } from "mongoose";

export class AuditLogRepository {
  static async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    return await AuditLog.create(data);
  }

  static async list(
    filter: FilterQuery<IAuditLog>,
    { skip, limit, sort }: { skip: number; limit: number; sort: any }
  ) {
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);
    return { items, total };
  }
}

export default AuditLogRepository;
