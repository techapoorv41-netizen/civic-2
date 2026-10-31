const Notification = require('../entities/notification.entity');

const insertMany = (docs) => Notification.insertMany(docs);
async function list(filter, { skip, limit }) {
  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  return { items, total };
}
const countUnread = (userId) => Notification.countDocuments({ userId, isRead: false });
const markRead = (id, userId) =>
  Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
const markAll = (userId) =>
  Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });

module.exports = { insertMany, list, countUnread, markRead, markAll };
