import Notification, { INotification } from "../entities/Notification.entity";
import { FilterQuery, Types } from "mongoose";

export class NotificationsRepository {
  static async insertMany(items: Partial<INotification>[]): Promise<INotification[]> {
    return (await Notification.insertMany(items)) as any;
  }

  static async findById(id: Types.ObjectId | string): Promise<INotification | null> {
    return await Notification.findById(id);
  }

  static async list(
    filter: FilterQuery<INotification>,
    { skip, limit }: { skip: number; limit: number }
  ) {
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: filter.userId, isRead: false }),
    ]);
    return { items, total, unreadCount };
  }

  static async updateMany(filter: FilterQuery<INotification>, update: any) {
    return await Notification.updateMany(filter, update);
  }
}

export default NotificationsRepository;
