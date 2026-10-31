const User = require('../entities/user.entity');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildFilter({ role, isBlocked, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (typeof isBlocked === 'boolean') filter.isBlocked = isBlocked;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  return filter;
}

async function list(filter, { skip, limit, sort }) {
  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { items, total };
}

module.exports = { buildFilter, list };