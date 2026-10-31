const AuditLog = require('../entities/auditLog.entity');

const create = (data) => AuditLog.create(data);
async function list(filter, { skip, limit }) {
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('actorId', 'name role').lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { items, total };
}

module.exports = { create, list };