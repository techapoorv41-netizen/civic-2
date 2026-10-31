const OfficialProfile = require('../entities/officialProfile.entity');

const create = (data) => OfficialProfile.create(data);
const findByUserId = (userId) => OfficialProfile.findOne({ userId });
const findById = (id) => OfficialProfile.findById(id).populate('userId', 'name email phone');
async function list(filter, { skip, limit }) {
  const [items, total] = await Promise.all([
    OfficialProfile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('userId', 'name email phone').lean(),
    OfficialProfile.countDocuments(filter),
  ]);
  return { items, total };
}
const verify = (id, adminId) =>
  OfficialProfile.findOneAndUpdate(
    { _id: id, isVerified: false },
    { $set: { isVerified: true, verifiedBy: adminId, verifiedAt: new Date() } },
    { new: true }
  );
const isVerifiedByUserId = async (userId) => {
  const p = await OfficialProfile.findOne({ userId }).select('isVerified').lean();
  return !!(p && p.isVerified);
};
module.exports = { create, findByUserId, findById, list, verify, isVerifiedByUserId };``