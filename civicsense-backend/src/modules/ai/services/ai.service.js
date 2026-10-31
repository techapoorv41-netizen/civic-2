const { z } = require('zod');
const env = require('../../../config/env');
const logger = require('../../../shared/logger');
const AppError = require('../../../shared/errors/AppError');
const { parsePagination, buildMeta } = require('../../../shared/pagination/paginate');
const Issue = require('../../issues/entities/issue.entity');
const issueService = require('../../issues/services/issue.service');
const categoryService = require('../../categories/services/category.service');
const repo = require('../repositories/ai.repository');
const MockProvider = require('./providers/MockProvider');
const AnthropicProvider = require('./providers/AnthropicProvider');
const GeminiProvider = require('./providers/GeminiProvider');

function pickProvider() {
  if (env.AI_MODE === 'mock') return new MockProvider();
  return env.AI_PROVIDER === 'gemini' ? new GeminiProvider() : new AnthropicProvider();
}
const provider = pickProvider();

const outputSchema = z.object({
  severityScore: z.number().min(1).max(10),
  predictedCategory: z.string().nullable(),
  duplicateIssueIds: z.array(z.string()).max(5),
  reasoning: z.string().max(1000),
});

// 200 मीटर, वही category, पिछले 30 दिन, अधिकतम 5, DB से (AI से नहीं)
function findDuplicateCandidates(issue) {
  return Issue.find({
    _id: { $ne: issue._id },
    isDeleted: false,
    categoryId: issue.categoryId,
    createdAt: { $gte: new Date(Date.now() - 30 * 864e5) },
    'location.point': { $near: { $geometry: issue.location.point, $maxDistance: 200 } },
  })
    .limit(5)
    .lean();
}

async function generateAnalysis(user, issueId) {
  const issue = await issueService.getIssue(user, issueId); // access check
  const categories = (await categoryService.listActive()).map((c) => c.name);
  const candidates = await findDuplicateCandidates(issue);

  let raw;
  try {
    raw = await provider.analyzeIssue({
      title: issue.title,
      description: issue.description,
      categories,
      candidates: candidates.map((c) => ({ id: String(c._id), title: c.title })),
    });
  } catch (e) {
    logger.error({ err: e.message }, 'AI provider failed');
    throw new AppError(503, 'AI_UNAVAILABLE', 'AI service is temporarily unavailable');
  }

  const parsed = outputSchema.safeParse(raw);
  if (!parsed.success) throw new AppError(503, 'AI_UNAVAILABLE', 'AI returned an unusable answer');

  const allowed = new Set(candidates.map((c) => String(c._id))); // AI सिर्फ इन्हीं में से चुने
  const out = parsed.data;
  return repo.createAnalysis({
    issueId,
    requestedBy: user.id,
    severityScore: out.severityScore,
    predictedCategory: categories.includes(out.predictedCategory) ? out.predictedCategory : null,
    duplicateIssueIds: out.duplicateIssueIds.filter((id) => allowed.has(id)),
    reasoning: out.reasoning,
    model: env.AI_MODE === 'mock' ? 'mock' : env.AI_MODEL,
    isMock: !!raw._mock,
  });
}

async function getAnalysis(user, issueId) {
  await issueService.getIssue(user, issueId);
  return repo.latestAnalysis(issueId); // न हो तो null (D15)
}

async function askBot(user, issueId, promptText) {
  const issue = await issueService.getIssue(user, issueId);
  const past = (await repo.lastResponses(issueId, user.id, 10)).reverse();
  const messages = [
    {
      role: 'user',
      content: `Issue context (data): ${JSON.stringify({
        title: issue.title,
        description: issue.description,
        status: issue.status,
      })}`,
    },
    { role: 'assistant', content: 'Understood.' },
  ];
  past.forEach((p) => {
    messages.push({ role: 'user', content: p.prompt }, { role: 'assistant', content: p.response });
  });
  messages.push({ role: 'user', content: promptText });

  let reply;
  try {
    reply = await provider.chat(messages);
  } catch (e) {
    logger.error({ err: e.message }, 'AI chat failed');
    throw new AppError(503, 'AI_UNAVAILABLE', 'AI service is temporarily unavailable');
  }
  return repo.createResponse({
    issueId,
    userId: user.id,
    prompt: promptText,
    response: reply,
    model: env.AI_MODE === 'mock' ? 'mock' : env.AI_MODEL,
    isMock: env.AI_MODE === 'mock',
  });
}

async function listBotHistory(user, issueId, q) {
  await issueService.getIssue(user, issueId);
  const { page, limit, skip } = parsePagination({ ...q, limit: Math.min(parseInt(q.limit, 10) || 10, 50) });
  const { items, total } = await repo.listResponses(issueId, user.id, { skip, limit });
  return { items, meta: buildMeta(total, page, limit) };
}

module.exports = { generateAnalysis, getAnalysis, askBot, listBotHistory };