const Comment = require('../entities/comment.entity');

const create = (data) => Comment.create(data);
async function listByIssue(issueId, { skip, limit }) {
  const [items, total] = await Promise.all([
    Comment.find({ issueId }).sort({ createdAt: 1 }).skip(skip).limit(limit)
      .populate('authorId', 'name role').lean(),
    Comment.countDocuments({ issueId }),
  ]);
  return { items, total };
}
const findWithAuthor = (id) => Comment.findById(id).populate('authorId', 'name role');

module.exports = { create, listByIssue, findWithAuthor };