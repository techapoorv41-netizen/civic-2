const Issue = require('../entities/issue.entity');

const create = (data) => Issue.create(data);

const findById = (id) => Issue.findOne({ _id: id, isDeleted: false });

const findByIdPopulated = (id) =>
  Issue.findOne({ _id: id, isDeleted: false })
    .populate('categoryId', 'name')
    .populate('reporterId', 'name')
    .populate('assignedOfficialId', 'name')
    .lean();

async function list(filter, { skip, limit, sort }) {
  const [items, total] = await Promise.all([
    Issue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name')
      .populate('reporterId', 'name')
      .lean(),
    Issue.countDocuments(filter),
  ]);
  return { items, total };
}

const updateById = (id, patch) =>
  Issue.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: patch },
    { new: true, runValidators: true }
  );

module.exports = { create, findById, findByIdPopulated, list, updateById };