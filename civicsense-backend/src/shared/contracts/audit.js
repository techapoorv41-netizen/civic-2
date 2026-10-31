/**
 * Contract: AuditService
 * @typedef {{actorId:string, action:string, targetType:string,
 *   targetId:string, metadata?:object}} AuditInput
 * @param {AuditInput} entry
 * @returns {Promise<void>} कभी throw नहीं करता
 */
const log = (entry) => require('../../modules/audit').auditService.log(entry);

module.exports = { log };