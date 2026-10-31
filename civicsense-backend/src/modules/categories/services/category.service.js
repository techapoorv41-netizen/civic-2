const repo = require('../repositories/category.repository');
const AppError = require('../../../shared/errors/AppError');
const logger = require('../../../shared/logger');

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const listActive = () => repo.listActive();

async function createCategory(admin, body) {
  let category;
  try {
    category = await repo.create({ ...body, slug: slugify(body.name), createdBy: admin.id });
  } catch (e) {
    
    if (e.code === 11000) throw new AppError(409, 'CONFLICT', 'Category already exists');
    throw e;
  }

  try {
    const audit = require('../../audit');
    await audit.auditService.log({
      actorId: admin.id,
      action: 'CATEGORY_CREATED',
      targetType: 'Category',
      targetId: category.id,
    });
  } catch (e) {
    logger.warn({ msg: 'audit skipped', reason: e.message });
  }
  return category;
}

const exists = async (id) => Boolean(await repo.findById(id));

module.exports = { listActive, createCategory, exists };