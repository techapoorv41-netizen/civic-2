const AIAnalysis = require('../entities/aiAnalysis.entity');
const AIResponse = require('../entities/aiResponse.entity');

const createAnalysis = (data) => AIAnalysis.create(data);
const latestAnalysis = (issueId) =>
  AIAnalysis.findOne({ issueId }).sort({ createdAt: -1 }).lean();

const createResponse = (data) => AIResponse.create(data);
const lastResponses = (issueId, userId, n) =>
  AIResponse.find({ issueId, userId }).sort({ createdAt: -1 }).limit(n).lean();

async function listResponses(issueId, userId, { skip, limit }) {
  const filter = { issueId, userId };
  const [items, total] = await Promise.all([
    AIResponse.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
    AIResponse.countDocuments(filter),
  ]);
  return { items, total };
}

module.exports = { createAnalysis, latestAnalysis, createResponse, lastResponses, listResponses };