export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  unreadCount?: number;
}

export const parsePagination = (
  query: Record<string, any> = {},
  allowedSortFields: string[] = ["createdAt", "priority", "status", "title", "updatedAt"]
): PaginationParams => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  if (query.sort && typeof query.sort === "string") {
    const rawSort = query.sort.trim();
    const isDesc = rawSort.startsWith("-");
    const field = isDesc ? rawSort.substring(1) : rawSort;

    if (allowedSortFields.includes(field)) {
      sort = { [field]: isDesc ? -1 : 1 };
    }
  }

  return { page, limit, skip, sort };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
  extraMeta: Record<string, any> = {}
): PaginationMeta => {
  const pages = Math.ceil(total / (limit || 1)) || 1;
  return {
    page,
    limit,
    total,
    pages,
    ...extraMeta,
  };
};

export const buildMeta = buildPaginationMeta;
