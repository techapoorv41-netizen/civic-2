const RefreshToken = require('../entities/refreshToken.entity');

const create = (data) => RefreshToken.create(data);
const findByHash = (tokenHash) => RefreshToken.findOne({ tokenHash });
const revoke = (id) => RefreshToken.updateOne({ _id: id }, { $set: { revokedAt: new Date() } });
const revokeAllForUser = (userId) =>
  RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });

module.exports = { create, findByHash, revoke, revokeAllForUser };