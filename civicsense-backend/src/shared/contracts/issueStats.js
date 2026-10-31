/**
 * @typedef {Object} IssueCounts
 * @property {number} total
 * @property {Object<string, number>} byStatus   e.g. { pending: 3, verified: 1 }
 * @property {Object<string, number>} byCategory e.g. { Road: 2, Garbage: 2 }
 */

/**
 * @returns {Promise<IssueCounts>}
 */
async function getCounts() {
  // PLACEHOLDER (Day 1): body Batch 2 me bharegi, signature nahi badlega
  return { total: 0, byStatus: {}, byCategory: {} };
}

module.exports = { getCounts };