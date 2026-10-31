const toAttachmentDto = (a) => ({
  id: String(a._id || a.id),
  url: a.url,
  mimeType: a.mimeType,
  size: a.size,
  originalName: a.originalName,
  uploadedBy: String(a.uploadedBy),
  createdAt: a.createdAt,
});

module.exports = { toAttachmentDto };