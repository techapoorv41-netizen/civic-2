const User = require('../entities/user.entity');
const OfficialProfile = require('../../officials/entities/officialProfile.entity');

async function getBasicById(id) {
  const u = await User.findById(id).select('name role isBlocked').lean();
  return u ? { id: String(u._id), name: u.name, role: u.role, isBlocked: u.isBlocked } : null;
}

async function isAssignableOfficial(userId) {
  const u = await User.findById(userId).select('role isBlocked').lean();
  if (!u || u.role !== 'official' || u.isBlocked) return false;
  const p = await OfficialProfile.findOne({ userId }).select('isVerified').lean();
  return !!(p && p.isVerified);
}

async function listAdminIds() {
  const admins = await User.find({ role: 'admin', isBlocked: false }).select('_id').lean();
  return admins.map((a) => String(a._id));
}

module.exports = { getBasicById, isAssignableOfficial, listAdminIds };