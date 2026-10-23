import User, { IUser } from "../entities/User.entity";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class UserRepository {
  static async findById(id: Types.ObjectId | string): Promise<IUser | null> {
    return await User.findById(id);
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  static async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
  }

  static async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }

  static async updateById(id: Types.ObjectId | string, update: UpdateQuery<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  static async list(filter: FilterQuery<IUser>, { skip, limit, sort }: { skip: number; limit: number; sort: any }) {
    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { items, total };
  }

  static async count(filter: FilterQuery<IUser> = {}): Promise<number> {
    return await User.countDocuments(filter);
  }
}

export default UserRepository;
