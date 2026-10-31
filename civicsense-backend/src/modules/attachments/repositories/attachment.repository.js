const Attachment = require('../entities/attachment.entity');

const create = (data) => Attachment.create(data);
const countByIssue = (issueId) => Attachment.countDocuments({ issueId });
const listByIssue = (issueId) => Attachment.find({ issueId }).sort({ createdAt: 1 }).lean();
const findById = (id) => Attachment.findById(id);
const remove = (id) => Attachment.deleteOne({ _id: id });

module.exports = { create, countByIssue, listByIssue, findById, remove };