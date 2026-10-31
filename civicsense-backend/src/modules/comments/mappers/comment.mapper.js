const toCommentDto = (c) => {
  const a = c.authorId && c.authorId.name ? c.authorId : null;
  return {
    id: String(c._id),
    issueId: String(c.issueId),
    message: c.message,
    author: a ? { id: String(a._id), name: a.name, role: a.role } : { id: String(c.authorId) },
    createdAt: c.createdAt,
  };
};

module.exports = { toCommentDto };