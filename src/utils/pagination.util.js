/**
 * Helper to parse page and limit query parameters.
 * Defaults: page = 1, limit = 10 (max limit = 100)
 */
export const getPaginationParams = (query = {}) => {
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || "10", 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Helper to format paginated API response metadata.
 */
export const formatPaginatedResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = page < totalPages;

  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasMore,
    },
  };
};
