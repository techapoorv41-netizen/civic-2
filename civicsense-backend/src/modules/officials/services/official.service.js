const repo = require('../repositories/official.repository');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');

const safe = async (fn) => {
  try { await fn(); } catch (e) { logger.error({ err: e.message }, 'side effect failed'); }
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function createProfile(user, body) {
  if (await repo.findByUserId(user.id)) throw new AppError(409, 'CONFLICT', 'Profile already exists');
  try {
    return await repo.create({ ...body, userId: user.id });
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'CONFLICT', 'Employee id already used');
    throw e;
  }
}

async function list(q) {
  const { page, limit, skip } = parsePagination(q);
  const filter = {};
  if (q.isVerified) filter.isVerified = q.isVerified === 'true';
  if (q.department) filter.department = q.department;
  if (q.search) {
    const r = new RegExp(esc(q.search), 'i');
    filter.$or = [{ department: r }, { designation: r }, { employeeId: r }];
  }
  const { items, total } = await repo.list(filter, { skip, limit });
  return { items, meta: buildMeta(total, page, limit) };
}

async function getById(user, id) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(404, 'NOT_FOUND', 'Official not found');
  const ownerId = String(p.userId._id || p.userId);
  if (user.role !== 'admin' && ownerId !== user.id) throw new AppError(403, 'FORBIDDEN', 'Not allowed');
  return p;
}

async function verify(admin, id) {
  const updated = await repo.verify(id, admin.id);
  if (!updated) {
    if (!(await repo.findById(id))) throw new AppError(404, 'NOT_FOUND', 'Official not found');
    throw new AppError(409, 'CONFLICT', 'Already verified');
  }
  const { auditService } = require('../../audit');
  const { notificationService } = require('../../notifications');
  await safe(() =>
    auditService.log({ actorId: admin.id, action: 'OFFICIAL_VERIFIED', targetType: 'OfficialProfile', targetId: id })
  );
  await safe(() =>
    notificationService.notify({
      type: 'OFFICIAL_VERIFIED',
      recipientIds: [String(updated.userId)],
      message: 'Your official profile is verified',
    })
  );
  return repo.findById(id);
}

module.exports = { createProfile, list, getById, verify };