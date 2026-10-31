function parsePagination(q) {
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});

function parseSort(sort = '-createdAt', allowed = ['createdAt', 'priority', 'status']) {
  const dir = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  return allowed.includes(field) ? { [field]: dir } : { createdAt: -1 };
}

module.exports = { parsePagination, buildMeta, parseSort };