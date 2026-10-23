export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string | null;
}
