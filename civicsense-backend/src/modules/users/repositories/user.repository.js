const User = require('../entities/user.entity');

const create = (data) => User.create(data);
const findById = (id) => User.findById(id);
const findByEmail = (email) => User.findOne({ email });
const findByEmailWithHash = (email) => User.findOne({ email }).select('+passwordHash');
const listByRole = (role) => User.find({ role });
const updateById = (id, patch) =>
  User.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true });

module.exports = { create, findById, findByEmail, findByEmailWithHash, listByRole, updateById };