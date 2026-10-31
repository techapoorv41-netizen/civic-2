const toUserDto = (u) => ({
  id: String(u._id || u.id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isBlocked: u.isBlocked,
  createdAt: u.createdAt,
});

module.exports = { toUserDto };