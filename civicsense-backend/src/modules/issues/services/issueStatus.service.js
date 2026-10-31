const Issue = require('../entities/issue.entity');
const historyRepo = require('../repositories/issueHistory.repository');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');

// from -> to -> कौन कर सकता है
const TRANSITIONS = {
  pending: { verified: ['admin'], rejected: ['admin'] },
  verified: { in_progress: ['official'], rejected: ['admin'] },
  in_progress: { resolved: ['official'] },
  resolved: {},
  rejected: {},
};

async function transition(issue, to, actor, remarks) {
  const rule = TRANSITIONS[issue.status] && TRANSITIONS[issue.status][to];
  if (!rule) {
    throw new AppError(409, 'INVALID_STATUS_TRANSITION', `Cannot move ${issue.status} to ${to}`);
  }
  if (!rule.includes(actor.role)) {
    throw new AppError(403, 'FORBIDDEN', 'Your role cannot do this change');
  }

  const patch = { status: to };
  if (remarks) patch.remarks = remarks;
  if (to === 'verified') Object.assign(patch, { verifiedBy: actor.id, verifiedAt: new Date() });
  if (to === 'resolved') patch.resolvedAt = new Date();

  // atomic: सिर्फ तब update जब status अभी भी पुराना है
  const updated = await Issue.findOneAndUpdate(
    { _id: issue.id, status: issue.status, isDeleted: false },
    { $set: patch },
    { new: true }
  );
  if (!updated) {
    throw new AppError(409, 'CONFLICT', 'Issue was changed by someone else, refresh');
  }

  await historyRepo.create({
    issueId: issue.id,
    previousStatus: issue.status,
    newStatus: to,
    actorId: actor.id,
    remarks,
  });

  if (to === 'rejected') {
    try {
      await require('../../notifications').notificationService.notify({
        type: 'ISSUE_STATUS_CHANGED',
        recipientIds: [String(issue.reporterId)],
        message: `Your issue "${issue.title}" was rejected`,
        issueId: issue.id,
      });
      await require('../../audit').auditService.log({
        actorId: actor.id,
        action: 'ISSUE_REJECTED',
        targetType: 'Issue',
        targetId: issue.id,
      });
    } catch (e) {
      logger.warn({ msg: 'notify/audit skipped', reason: e.message });
    }
  }
  return updated;
}

module.exports = { transition, TRANSITIONS };