const repo = require('../repositories/assignment.repository');
const issueRepo = require('../../issues/repositories/issue.repository');
const { transition } = require('../../issues/services/issueStatus.service');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');

// Ronak के modules: न हों तो request फेल नहीं होगी
async function safe(fn, label) {
  try {
    return await fn();
  } catch (e) {
    logger.warn({ msg: `${label} skipped`, reason: e.message });
  }
}
const notify = (p) => safe(() => require('../../notifications').notificationService.notify(p), 'notify');
const audit = (p) => safe(() => require('../../audit').auditService.log(p), 'audit');
const directory = () => require('../../users').userDirectory;
const adminIds = async () => (await safe(() => directory().listAdminIds(), 'adminIds')) || [];

async function assign(admin, issueId, { officialId, dueDate, remarks }) {
  const issue = await issueRepo.findById(issueId);
  if (!issue) throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  if (issue.status !== 'verified') {
    throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Only verified issues can be assigned');
  }
  const okOfficial = await directory().isAssignableOfficial(officialId);
  if (!okOfficial) throw new AppError(422, 'VALIDATION_ERROR', 'Official is not verified or is blocked');

  let a;
  try {
    a = await repo.create({
      issueId,
      officialId,
      assignedBy: admin.id,
      dueDate,
      remarks,
      statusLog: [{ status: 'assigned', at: new Date(), remarks }],
    });
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'CONFLICT', 'Issue already has an active assignment');
    throw e;
  }

  await issueRepo.updateById(issueId, { assignedOfficialId: officialId });
  await audit({ actorId: admin.id, action: 'ISSUE_ASSIGNED', targetType: 'Issue', targetId: issueId });
  await notify({
    type: 'ISSUE_ASSIGNED',
    recipientIds: [officialId, String(issue.reporterId)],
    message: 'Issue assigned',
    issueId,
    assignmentId: a.id,
  });
  return a;
}

async function explainFailure(user, id) {
  const a = await repo.findById(id);
  if (!a) throw new AppError(404, 'NOT_FOUND', 'Assignment not found');
  if (String(a.officialId) !== user.id) throw new AppError(403, 'FORBIDDEN', 'Not your assignment');
  throw new AppError(409, 'INVALID_ASSIGNMENT_STATE', `Assignment is already ${a.status}`);
}

async function accept(user, id) {
  const now = new Date();
  const a = await repo.updateIf(
    { _id: id, officialId: user.id, status: 'assigned' },
    { $set: { status: 'accepted', acceptedAt: now }, $push: { statusLog: { status: 'accepted', at: now } } }
  );
  if (!a) return explainFailure(user, id);

  const issue = await issueRepo.findById(a.issueId);
  await transition(issue, 'in_progress', user); // verified -> in_progress
  await notify({
    type: 'ASSIGNMENT_ACCEPTED',
    recipientIds: [String(issue.reporterId), ...(await adminIds())],
    message: 'Assignment accepted',
    issueId: a.issueId,
    assignmentId: a.id,
  });
  return a;
}

async function complete(user, id, remarks) {
  const now = new Date();
  const a = await repo.updateIf(
    { _id: id, officialId: user.id, status: 'accepted' },
    {
      $set: { status: 'completed', isActive: false, completedAt: now, completionRemarks: remarks },
      $push: { statusLog: { status: 'completed', at: now, remarks } },
    }
  );
  if (!a) return explainFailure(user, id);

  const issue = await issueRepo.findById(a.issueId);
  await transition(issue, 'resolved', user, remarks); // in_progress -> resolved
  await notify({
    type: 'ISSUE_RESOLVED',
    recipientIds: [String(issue.reporterId), ...(await adminIds())],
    message: 'Issue resolved',
    issueId: a.issueId,
    assignmentId: a.id,
  });
  return a;
}

async function reject(user, id, reason) {
  const now = new Date();
  const a = await repo.updateIf(
    { _id: id, officialId: user.id, status: 'assigned' },
    {
      $set: { status: 'rejected', isActive: false, rejectedAt: now, rejectionReason: reason },
      $push: { statusLog: { status: 'rejected', at: now, remarks: reason } },
    }
  );
  if (!a) return explainFailure(user, id);

  await issueRepo.updateById(a.issueId, { assignedOfficialId: null }); // issue verified ही रहेगी
  await notify({
    type: 'ASSIGNMENT_REJECTED',
    recipientIds: await adminIds(),
    message: `Assignment rejected: ${reason}`,
    issueId: a.issueId,
    assignmentId: a.id,
  });
  return a;
}

async function listMine(user, q) {
  const { page, limit, skip } = parsePagination(q);
  const filter = { officialId: user.id };
  if (q.status) filter.status = q.status;
  const { items, total } = await repo.listByOfficial(filter, { skip, limit });
  return { items, meta: buildMeta(total, page, limit) };
}

module.exports = { assign, accept, complete, reject, listMine };