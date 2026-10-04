export function parseJson(value, fallback = {}) {
  try {
    if (value == null) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

export function serializeMedia(item, interaction = null) {
  if (!item) return null;
  return {
    ...item,
    boxOfficeOrRank:
      typeof item.boxOfficeOrRank === 'bigint'
        ? Number(item.boxOfficeOrRank)
        : item.boxOfficeOrRank,
    genreTags: parseJson(item.genreTags, []),
    metadata: parseJson(item.metadata, {}),
    discussionCount: item._count?.forumPosts ?? item.discussionCount ?? 0,
    interaction: interaction
      ? {
          isFavorite: interaction.isFavorite,
          wishlistStatus: interaction.wishlistStatus,
          userRating: interaction.userRating,
          reviewText: interaction.reviewText,
        }
      : null,
  };
}

export function maturityRank(rating) {
  const map = { G: 0, PG13: 1, R: 2, ADULT_18: 3 };
  return map[rating] ?? 3;
}

export function canViewMaturity(userMax, itemRating) {
  return maturityRank(itemRating) <= maturityRank(userMax || 'ADULT_18');
}

export function paginate({ page = 1, limit = 24 } = {}) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 24));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
}
