/** notify({type, recipientIds[], message, issueId?, assignmentId?}) */
/**
 * Contract: NotificationService
 * @typedef {{type:string, recipientIds:string[], message:string,
 *   issueId?:string, assignmentId?:string}} NotifyInput
 * @param {NotifyInput} input
 * @returns {Promise<void>} कभी throw नहीं करता
 */
const notify = (input) =>
  require('../../modules/notifications').notificationService.notify(input);

module.exports = { notify };