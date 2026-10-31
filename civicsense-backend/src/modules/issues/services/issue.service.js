const repo = require('../repositories/issue.repository');
const historyRepo = require('../repositories/issueHistory.repository');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');
const { parsePagination, buildMeta, parseSort } = require('../../../shared/pagination/paginate');
const { transition } = require('./issueStatus.service');

async function notify(payload) {
  try {
    await require('../../notifications').notificationService.notify(payload);
  } catch (e) {
    logger.warn({ msg: 'notify skipped', reason: e.message });
  }
}
async function audit(entry) {
  try {
    await require('../../audit').auditService.log(entry);
  } catch (e) {
    logger.warn({ msg: 'audit skipped', reason: e.message });
  }
}
async function adminIds() {
  try {
    return await require('../../users').userDirectory.listAdminIds();
  } catch (e) {
    logger.warn({ msg: 'listAdminIds skipped', reason: e.message });
    return [];
  }
}

// कौन क्या देख सकता है (D11)
function visibility(user) {
  if (user.role === 'citizen') return { reporterId: user.id };
  if (user.role === 'official') return { assignedOfficialId: user.id };
  return {};
}

function canView(user, issue) {
  return (
    user.role === 'admin' ||
    String(issue.reporterId) === user.id ||
    String(issue.assignedOfficialId) === user.id
  );
}

async function ensureCategory(categoryId) {
  const ok = await require('../../categories').categoryService.exists(categoryId);
  if (!ok) throw new AppError(422, 'VALIDATION_ERROR', 'Category does not exist');
}

const withPoint = (loc) => ({
  ...loc,
  point: { type: 'Point', coordinates: [loc.lng, loc.lat] },
});

async function createIssue(user, body) {
  await ensureCategory(body.categoryId);
  const issue = await repo.create({
    ...body,
    reporterId: user.id,
    location: withPoint(body.location),
  });
  await historyRepo.create({
    issueId: issue.id,
    previousStatus: null,
    newStatus: 'pending',
    actorId: user.id,
  });
  await notify({
    type: 'ISSUE_CREATED',
    recipientIds: await adminIds(),
    message: `New issue: ${issue.title}`,
    issueId: issue.id,
  });
  return issue;
}

async function listIssues(user, q) {
  const { page, limit, skip } = parsePagination(q);
  const filter = { isDeleted: false, ...visibility(user) };
  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.category) filter.categoryId = q.category;
  if (q.search) filter.$text = { $search: q.search };
  if (q.from || q.to) {
    filter.createdAt = { ...(q.from && { $gte: q.from }), ...(q.to && { $lte: q.to }) };
  }
  if (q.assignedTo && user.role === 'admin') {
    filter.assignedOfficialId = q.assignedTo === 'me' ? user.id : q.assignedTo;
  }
  const { items, total } = await repo.list(filter, { skip, limit, sort: parseSort(q.sort) });
  return { items, meta: buildMeta(total, page, limit) };
}

// दूसरे modules (attachments, ai) भी यही इस्तेमाल करेंगे
async function getIssue(user, id) {
  const issue = await repo.findById(id);
  if (!issue || !canView(user, issue)) throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  return issue;
}

async function getIssueDetail(user, id) {
  await getIssue(user, id);
  return repo.findByIdPopulated(id);
}

async function updateIssue(user, id, body) {
  const issue = await getIssue(user, id);
  const isReporter = String(issue.reporterId) === user.id && user.role === 'citizen';
  const reporterFields = ['title', 'description', 'categoryId', 'location'];
  const staffFields = ['priority', 'remarks', 'status'];
  const sent = Object.keys(body);

  if (isReporter) {
    if (sent.some((k) => !reporterFields.includes(k))) {
      throw new AppError(403, 'FORBIDDEN', 'You can edit only title, description, category, location');
    }
    if (issue.status !== 'pending') {
      throw new AppError(409, 'CONFLICT', 'Only pending issues can be edited');
    }
  } else {
    if (sent.some((k) => !staffFields.includes(k))) {
      throw new AppError(403, 'FORBIDDEN', 'You can change only priority, remarks, status');
    }
  }

  const { status, ...rest } = body;
  if (rest.categoryId) await ensureCategory(rest.categoryId);
  if (rest.location) rest.location = withPoint(rest.location);

  let current = issue;
  if (Object.keys(rest).length) current = await repo.updateById(id, rest);
  if (status) current = await transition(issue, status, user, body.remarks);
  return current;
}

async function deleteIssue(user, id) {
  const issue = await getIssue(user, id);
  const own = String(issue.reporterId) === user.id && issue.status === 'pending';
  if (user.role !== 'admin' && !own) throw new AppError(403, 'FORBIDDEN', 'Not allowed');
  await repo.updateById(id, { isDeleted: true, deletedAt: new Date() });
  await audit({ actorId: user.id, action: 'ISSUE_DELETED', targetType: 'Issue', targetId: id });
}

async function verifyIssue(admin, id, remarks) {
  const issue = await getIssue(admin, id);
  const updated = await transition(issue, 'verified', admin, remarks);
  await notify({
    type: 'ISSUE_VERIFIED',
    recipientIds: [String(issue.reporterId)],
    message: `Your issue "${issue.title}" was verified`,
    issueId: id,
  });
  await audit({ actorId: admin.id, action: 'ISSUE_VERIFIED', targetType: 'Issue', targetId: id });
  return updated;
}

async function getHistory(user, id) {
  await getIssue(user, id);
  return historyRepo.listByIssue(id);
}

module.exports = {
  createIssue,
  listIssues,
  getIssue,
  getIssueDetail,
  updateIssue,
  deleteIssue,
  verifyIssue,
  getHistory,
  canView,
};