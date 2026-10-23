import { CategoryDTO } from "../dtos/categories.dto";

export const toCategoryDTO = (cat: any): CategoryDTO | null => {
  if (!cat) return null;
  const raw = cat.toObject ? cat.toObject() : { ...cat };
  return {
    id: (raw._id || raw.id).toString(),
    name: raw.name,
    slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: raw.description || null,
    icon: raw.icon || null,
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
};

export default { toCategoryDTO };
