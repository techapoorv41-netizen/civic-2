const Category = require('../entities/category.entity');

const create = (data) => Category.create(data);

const listActive = () =>
  Category.find({ isActive: true }).sort({ name: 1 }).collation({ locale: 'en', strength: 2 }).lean();

const findById = (id) => Category.findById(id).lean();

module.exports = { create, listActive, findById };