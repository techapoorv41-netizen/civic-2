const repo = require('../repositories/notification.repository');
const AppError = require('../../../shared/errors/AppError');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');

// Apoorv ka code ye call karta hai. Fail ho to caller try/catch me hai.
async function notify({ type, recipientIds, message, issueId, assignmentId }) {
  const unique = [...new Set((recipientIds || []).map(String))];
  if (!unique.length) return;
  await repo.insertMany(unique.map((userId) => ({ userId, type, message, issueId, assignmentId })));
}

async function listMine(user, q) {
  const { page, limit, skip } = parsePagination(q);
  const filter = { userId: user.id };
  if (q.isRead) filter.isRead = q.isRead === 'true';
  if (q.type) filter.type = q.type;
  const { items, total } = await repo.list(filter, { skip, limit });
  const unreadCount = await repo.countUnread(user.id);
  return { items, meta: { ...buildMeta(total, page, limit), unreadCount } };
}

async function markRead(user, id) {
  const n = await repo.markRead(id, user.id);
  if (!n) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  return n;
}

async function readAll(user) {
  const r = await repo.markAll(user.id);
  return { modifiedCount: r.modifiedCount };
}

module.exports = { notify, listMine, markRead, readAll };