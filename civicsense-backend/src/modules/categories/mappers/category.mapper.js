const toCategoryDto = (c) => ({
  id: String(c._id || c.id),
  name: c.name,
  slug: c.slug,
  description: c.description || null,
  icon: c.icon || null,
});

module.exports = { toCategoryDto };