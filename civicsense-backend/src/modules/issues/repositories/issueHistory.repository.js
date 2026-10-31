const IssueHistory = require('../entities/issueHistory.entity');

const create = (data) => IssueHistory.create(data);

const listByIssue = (issueId) =>
  IssueHistory.find({ issueId }).sort({ createdAt: 1 }).populate('actorId', 'name role').lean();

module.exports = { create, listByIssue };