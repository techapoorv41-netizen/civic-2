import Category, { ICategory } from "../entities/Category.entity";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

export class CategoriesRepository {
  static async findById(id: Types.ObjectId | string): Promise<ICategory | null> {
    return await Category.findById(id);
  }

  static async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
  }

  static async create(data: Partial<ICategory>): Promise<ICategory> {
    return await Category.create(data);
  }

  static async updateById(
    id: Types.ObjectId | string,
    update: UpdateQuery<ICategory>
  ): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  static async list(filter: FilterQuery<ICategory> = {}) {
    return await Category.find(filter)
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .lean();
  }
}

export default CategoriesRepository;
