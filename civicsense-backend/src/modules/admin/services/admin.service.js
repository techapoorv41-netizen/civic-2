const AppError = require('../../../shared/errors/AppError');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');
const userRepo = require('../../users/repositories/user.repository');
const User = require('../../users/entities/user.entity');
const tokenRepo = require('../../auth/repositories/refreshToken.repository');
const auditRepo = require('../../audit/repositories/audit.repository');
const { auditService } = require('../../audit');

async function blockUser(admin, id, reason) {
  const target = await userRepo.findById(id);
  if (!target) throw new AppError(404, 'NOT_FOUND', 'User not found');
  if (target.id === admin.id || target.role === 'admin')
    throw new AppError(403, 'FORBIDDEN', 'Cannot block this user');
  const u = await userRepo.updateById(id, {
    isBlocked: true, blockedReason: reason, blockedBy: admin.id, blockedAt: new Date(),
  });
  await tokenRepo.revokeAllForUser(id);
  await auditService.log({
    actorId: admin.id, action: 'USER_BLOCKED', targetType: 'User', targetId: id, metadata: { reason },
  });
  return u;
}

async function unblockUser(admin, id) {
  const target = await userRepo.findById(id);
  if (!target) throw new AppError(404, 'NOT_FOUND', 'User not found');
  const u = await userRepo.updateById(id, { isBlocked: false, blockedReason: null });
  await auditService.log({ actorId: admin.id, action: 'USER_UNBLOCKED', targetType: 'User', targetId: id });
  return u;
}

async function listActions(q) {
  const { page, limit, skip } = parsePagination(q);
  const filter = {};
  if (q.action) filter.action = q.action;
  if (q.actorId) filter.actorId = q.actorId;
  if (q.targetType) filter.targetType = q.targetType;
  if (q.from || q.to)
    filter.createdAt = { ...(q.from && { $gte: q.from }), ...(q.to && { $lte: q.to }) };
  const { items, total } = await auditRepo.list(filter, { skip, limit });
  return { items, meta: buildMeta(total, page, limit) };
}

async function stats() {
  const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  let pendingOfficials = 0;
  try {
    pendingOfficials = await require('../../officials/entities/officialProfile.entity').countDocuments({
      isVerified: false,
    });
  } catch {}
  let issues = null;
  try {
    const m = require('../../../shared/contracts/issueStats');
    const getCounts = m.getCounts || (m.issueStats && m.issueStats.getCounts);
    issues = await getCounts();
  } catch {}
  return {
    usersByRole: Object.fromEntries(byRole.map((r) => [r._id, r.count])),
    pendingOfficials,
    issues,
  };
}

module.exports = { blockUser, unblockUser, listActions, stats };