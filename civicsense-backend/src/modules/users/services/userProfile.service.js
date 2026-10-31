const AppError = require('../../../shared/errors/AppError');
const { parsePagination, buildMeta, parseSort } = require('../../../shared/pagination/paginate');
const userRepo = require('../repositories/user.repository');
const userQuery = require('../repositories/userQuery.repository');
const { toUserDto } = require('../mappers/user.mapper');

/** खुद या admin को पूरा profile, बाकी को सिर्फ id, name, role */
async function getById(requester, id) {
  const u = await userRepo.findById(id);
  if (!u) throw new AppError(404, 'NOT_FOUND', 'User not found');
  if (requester.role === 'admin' || requester.id === String(u._id)) return toUserDto(u);
  return { id: String(u._id), name: u.name, role: u.role };
}

/** सिर्फ name, phone बदलता है (schema .strict() है) */
async function updateMe(requester, patch) {
  const u = await userRepo.updateById(requester.id, patch);
  if (!u) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return toUserDto(u);
}

async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query);
  const sort = parseSort(query.sort, ['createdAt', 'name']);
  const { items, total } = await userQuery.list(userQuery.buildFilter(query), { skip, limit, sort });
  return { items: items.map(toUserDto), meta: buildMeta(total, page, limit) };
}

module.exports = { getById, updateMe, listUsers };