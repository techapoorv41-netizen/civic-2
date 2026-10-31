const auditService = require('./services/audit.service');

module.exports = { auditService, log: auditService.log };