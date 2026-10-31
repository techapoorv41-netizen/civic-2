const repo = require('../repositories/audit.repository');
const logger = require('../../../shared/logger');

// audit fail ho to main request fail nahi hogi
async function log({ actorId, action, targetType, targetId, metadata }) {
  try {
    await repo.create({ actorId, action, targetType, targetId: targetId && String(targetId), metadata });
  } catch (e) {
    logger.error({ err: e.message }, 'audit log failed');
  }
}

module.exports = { log };