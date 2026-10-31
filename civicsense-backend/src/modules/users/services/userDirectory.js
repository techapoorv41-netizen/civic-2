const mongoose = require('mongoose');
const User = require('../entities/user.entity');
const officialRepo = require('../../officials/repositories/official.repository');

/**
 * @param {string} id
 * @returns {Promise<{id:string,name:string,role:string,isBlocked:boolean}|null>}
 */
async function getBasicById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const u = await User.findById(id).select('name role isBlocked').lean();
  if (!u) return null;
  return { id: String(u._id), name: u.name, role: u.role, isBlocked: !!u.isBlocked };
}

/**
 * official हो, blocked न हो, और profile verified हो
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function isAssignableOfficial(userId) {
  if (!mongoose.isValidObjectId(userId)) return false;
  const u = await User.findById(userId).select('role isBlocked').lean();
  if (!u || u.role !== 'official' || u.isBlocked) return false;
  return officialRepo.isVerifiedByUserId(userId);
}

/** @returns {Promise<string[]>} */
async function listAdminIds() {
  const admins = await User.find({ role: 'admin', isBlocked: { $ne: true } })
    .select('_id')
    .lean();
  return admins.map((a) => String(a._id));
}

module.exports = { getBasicById, isAssignableOfficial, listAdminIds };