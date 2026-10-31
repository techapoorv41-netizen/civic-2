const crypto = require('crypto');
const { fromBuffer } = require('file-type');
const repo = require('../repositories/attachment.repository');
const issueService = require('../../issues/services/issue.service');
const storage = require('../../../shared/storage');
const env = require('../../../config/env');
const AppError = require('../../../shared/errors/AppError');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

async function addAttachment(user, issueId, file) {
  const issue = await issueService.getIssue(user, issueId); // access check
  if (user.role !== 'admin' && String(issue.reporterId) !== user.id) {
    throw new AppError(403, 'FORBIDDEN', 'Not allowed');
  }
  if (!file) throw new AppError(422, 'VALIDATION_ERROR', 'file is required');

  // magic bytes: असली फाइल की जाँच (नाम/MIME झूठा हो सकता है)
  const type = await fromBuffer(file.buffer);
  if (!type || !ALLOWED.includes(type.mime)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'File content is not a valid image');
  }
  if ((await repo.countByIssue(issueId)) >= 5) {
    throw new AppError(409, 'CONFLICT', 'Max 5 attachments per issue');
  }

  const key = `issues/${issueId}/${crypto.randomUUID()}.${type.ext}`; // random नाम
  const stored = await storage.upload({ buffer: file.buffer, key, mimeType: type.mime });

  return repo.create({
    issueId,
    uploadedBy: user.id,
    url: stored.url,
    storageKey: stored.key,
    provider: env.STORAGE_DRIVER,
    mimeType: type.mime,
    size: file.size,
    originalName: String(file.originalname).replace(/[^\w.\- ]/g, '_').slice(0, 100),
  });
}

async function listAttachments(user, issueId) {
  await issueService.getIssue(user, issueId);
  return repo.listByIssue(issueId);
}

async function removeAttachment(user, issueId, id) {
  await issueService.getIssue(user, issueId);
  const a = await repo.findById(id);
  if (!a || String(a.issueId) !== issueId) throw new AppError(404, 'NOT_FOUND', 'Attachment not found');
  if (user.role !== 'admin' && String(a.uploadedBy) !== user.id) {
    throw new AppError(403, 'FORBIDDEN', 'Not allowed');
  }
  await storage.delete({ key: a.storageKey });
  await repo.remove(id);
}

module.exports = { addAttachment, listAttachments, removeAttachment };