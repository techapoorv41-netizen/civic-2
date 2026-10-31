const mongoose = require('mongoose');
const issueRepo = require('../../modules/issues/repositories/issue.repository');

/**
 * @typedef {Object} IssueBasic
 * @property {string} id
 * @property {string} reporterId
 * @property {string|null} assignedOfficialId
 * @property {string} status
 */

/**
 * Issue की basic info। नहीं मिला या deleted हो तो null।
 * @param {string} issueId
 * @returns {Promise<IssueBasic|null>}
 */
async function getBasic(issueId) {
  if (!mongoose.isValidObjectId(issueId)) return null;
  const i = await issueRepo.findById(issueId);
  if (!i) return null;
  return {
    id: String(i._id),
    reporterId: String(i.reporterId),
    assignedOfficialId: i.assignedOfficialId ? String(i.assignedOfficialId) : null,
    status: i.status,
  };
}

module.exports = { getBasic };