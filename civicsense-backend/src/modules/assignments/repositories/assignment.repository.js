const Assignment = require('../entities/assignment.entity');

const create = (data) => Assignment.create(data);
const findById = (id) => Assignment.findById(id);

// check + update एक साथ (atomic)
const updateIf = (filter, update) => Assignment.findOneAndUpdate(filter, update, { new: true });

async function listByOfficial(filter, { skip, limit }) {
  const [items, total] = await Promise.all([
    Assignment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('issueId', 'title status priority location')
      .lean(),
    Assignment.countDocuments(filter),
  ]);
  return { items, total };
}

module.exports = { create, findById, updateIf, listByOfficial };