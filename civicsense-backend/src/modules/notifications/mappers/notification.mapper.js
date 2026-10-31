const toNotificationDto = (n) => ({
  id: String(n._id || n.id),
  type: n.type,
  message: n.message,
  isRead: n.isRead,
  readAt: n.readAt || null,
  issueId: n.issueId ? String(n.issueId) : null,
  assignmentId: n.assignmentId ? String(n.assignmentId) : null,
  createdAt: n.createdAt,
});

module.exports = { toNotificationDto };