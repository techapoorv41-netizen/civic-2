const repo = require('../repositories/comment.repository');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');
const lookupMod = require('../../../shared/contracts/issueLookup');

const getBasic = lookupMod.getBasic || (lookupMod.issueLookup && lookupMod.issueLookup.getBasic);

async function ensureAccess(user, issueId) {
  const issue = await getBasic(issueId);
  if (!issue) throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  const ok =
    user.role === 'admin' ||
    String(issue.reporterId) === user.id ||
    String(issue.assignedOfficialId) === user.id;
  if (!ok) throw new AppError(403, 'FORBIDDEN', 'Not allowed');
  return issue;
}

async function addComment(user, issueId, { message }) {
  const issue = await ensureAccess(user, issueId);
  const c = await repo.create({ issueId, authorId: user.id, message });
  try {
    const { notificationService } = require('../../notifications');
    const recipients = [issue.reporterId, issue.assignedOfficialId]
      .filter(Boolean)
      .map(String)
      .filter((id) => id !== user.id);
    await notificationService.notify({
      type: 'COMMENT_ADDED', recipientIds: recipients, message: 'New comment on issue', issueId,
    });
  } catch (e) {
    logger.error({ err: e.message }, 'comment notify failed');
  }
  return repo.findWithAuthor(c.id);
}

async function listComments(user, issueId, q) {
  await ensureAccess(user, issueId);
  const { page, limit, skip } = parsePagination(q);
  const { items, total } = await repo.listByIssue(issueId, { skip, limit });
  return { items, meta: buildMeta(total, page, limit) };
}

module.exports = { addComment, listComments };