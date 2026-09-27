import { prisma } from '../config/db.js';
import { parseJson, serializeMedia, canViewMaturity, paginate } from '../utils/helpers.js';
import { getMediaEnrichmentData } from '../services/mediaEnrichmentService.js';

export async function listMedia(req, res, next) {
  try {
    const { type, search, genre, language, sort = 'rating', page, limit } = req.query;
    const { skip, take, page: p, limit: l } = paginate({ page, limit });

    const where = {};
    if (type) where.type = String(type).toUpperCase();
    if (language) where.language = String(language);
    if (search) {
      where.title = { contains: String(search) };
    }
    if (genre) {
      where.genreTags = { contains: String(genre) };
    }

    if (req.user?.childLockEnabled) {
      const max = req.user.maxMaturityRating || 'PG13';
      const allowed = ['G', 'PG13', 'R', 'ADULT_18'].filter((r) => canViewMaturity(max, r));
      where.maturityRating = { in: allowed };
    }

    const orderBy =
      sort === 'year'
        ? { releaseYear: 'desc' }
        : sort === 'title'
          ? { title: 'asc' }
          : sort === 'rank'
            ? { boxOfficeOrRank: 'desc' }
            : { averageRating: 'desc' };

    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({ where, orderBy, skip, take }),
      prisma.mediaItem.count({ where }),
    ]);

    let interactionMap = {};
    if (req.user) {
      const interactions = await prisma.userMediaInteraction.findMany({
        where: { userId: req.user.id, mediaId: { in: items.map((i) => i.id) } },
      });
      interactionMap = Object.fromEntries(interactions.map((i) => [i.mediaId, i]));
    }

    res.json({
      items: items.map((item) => serializeMedia(item, interactionMap[item.id])),
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMedia(req, res, next) {
  try {
    const item = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Media not found' });

    if (
      req.user?.childLockEnabled &&
      !canViewMaturity(req.user.maxMaturityRating, item.maturityRating)
    ) {
      return res.status(403).json({ error: 'Content blocked by child lock' });
    }

    let interaction = null;
    if (req.user) {
      interaction = await prisma.userMediaInteraction.findUnique({
        where: { userId_mediaId: { userId: req.user.id, mediaId: item.id } },
      });
    }

    res.json({ item: serializeMedia(item, interaction) });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const taste = parseJson(req.user?.tasteProfile, { genres: [], formats: [] });
    const genres = taste.genres || [];
    const formats = taste.formats || [];

    const typeMap = {
      Movies: 'MOVIE',
      Movie: 'MOVIE',
      'Action Movies': 'MOVIE',
      Series: 'SERIES',
      Anime: 'SERIES',
      Games: 'GAME',
      'Story Games': 'GAME',
      'AAA Story Games': 'GAME',
      Books: 'BOOK',
      Manga: 'MANGA',
      Music: 'MUSIC_ALBUM',
      Albums: 'MUSIC_ALBUM',
    };

    const types = [
      ...new Set(
        formats
          .map((f) => typeMap[f] || null)
          .filter(Boolean)
          .concat(
            genres.some((g) => /movie/i.test(g)) ? ['MOVIE'] : [],
            genres.some((g) => /game/i.test(g)) ? ['GAME'] : [],
            genres.some((g) => /manga/i.test(g)) ? ['MANGA'] : [],
            genres.some((g) => /anime|series/i.test(g)) ? ['SERIES'] : [],
            genres.some((g) => /music|album|pop/i.test(g)) ? ['MUSIC_ALBUM'] : [],
            genres.some((g) => /book/i.test(g)) ? ['BOOK'] : []
          )
      ),
    ];

    const where = types.length ? { type: { in: types } } : {};
    if (req.user?.childLockEnabled) {
      const max = req.user.maxMaturityRating || 'PG13';
      const allowed = ['G', 'PG13', 'R', 'ADULT_18'].filter((r) => canViewMaturity(max, r));
      where.maturityRating = { in: allowed };
    }

    let items = await prisma.mediaItem.findMany({
      where,
      orderBy: { averageRating: 'desc' },
      take: 48,
    });

    if (genres.length) {
      const scored = items
        .map((item) => {
          const tags = parseJson(item.genreTags, []);
          const score = tags.reduce(
            (acc, t) => acc + (genres.some((g) => g.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(g.toLowerCase())) ? 2 : 0),
            item.averageRating
          );
          return { item, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
      items = scored;
    }

    res.json({ items: items.slice(0, 24).map((i) => serializeMedia(i)) });
  } catch (err) {
    next(err);
  }
}

export async function upsertInteraction(req, res, next) {
  try {
    const { mediaId } = req.params;
    const { isFavorite, wishlistStatus, userRating, reviewText } = req.body;

    const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const existing = await prisma.userMediaInteraction.findUnique({
      where: { userId_mediaId: { userId: req.user.id, mediaId } },
    });

    const data = {};
    if (isFavorite !== undefined) data.isFavorite = Boolean(isFavorite);
    if (wishlistStatus !== undefined) data.wishlistStatus = wishlistStatus;
    if (userRating !== undefined) data.userRating = userRating == null ? null : Number(userRating);
    if (reviewText !== undefined) data.reviewText = reviewText;

    const interaction = existing
      ? await prisma.userMediaInteraction.update({ where: { id: existing.id }, data })
      : await prisma.userMediaInteraction.create({
          data: { userId: req.user.id, mediaId, ...data },
        });

    if (userRating !== undefined) {
      const rated = await prisma.userMediaInteraction.findMany({
        where: { mediaId, userRating: { not: null } },
        select: { userRating: true },
      });
      const avg =
        rated.length === 0
          ? 0
          : rated.reduce((s, r) => s + r.userRating, 0) / rated.length;
      await prisma.mediaItem.update({
        where: { id: mediaId },
        data: { averageRating: Math.round(avg * 10) / 10, ratingCount: rated.length },
      });
    }

    const updated = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
    res.json({ item: serializeMedia(updated, interaction) });
  } catch (err) {
    next(err);
  }
}

export async function getUserLibrary(req, res, next) {
  try {
    const { filter } = req.query;
    const where = { userId: req.user.id };
    if (filter === 'favorites') where.isFavorite = true;
    else if (filter && filter !== 'all') where.wishlistStatus = filter;

    const interactions = await prisma.userMediaInteraction.findMany({
      where,
      include: { media: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      items: interactions.map((i) => serializeMedia(i.media, i)),
    });
  } catch (err) {
    next(err);
  }
}

export async function searchMedia(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ groups: {}, total: 0, items: [] });

    const where = { title: { contains: q } };
    if (req.user?.childLockEnabled) {
      const max = req.user.maxMaturityRating || 'PG13';
      const allowed = ['G', 'PG13', 'R', 'ADULT_18'].filter((r) => canViewMaturity(max, r));
      where.maturityRating = { in: allowed };
    }

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { averageRating: 'desc' },
      take: 40,
    });

    const groups = {};
    for (const item of items) {
      if (!groups[item.type]) groups[item.type] = [];
      if (groups[item.type].length < 8) {
        groups[item.type].push(serializeMedia(item));
      }
    }

    res.json({
      items: items.map((i) => serializeMedia(i)),
      groups,
      total: items.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function listGenres(req, res, next) {
  try {
    const type = req.query.type ? String(req.query.type).toUpperCase() : null;
    const items = await prisma.mediaItem.findMany({
      where: type ? { type } : undefined,
      select: { genreTags: true },
    });

    const counts = {};
    for (const item of items) {
      const tags = parseJson(item.genreTags, []);
      for (const tag of tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }

    const genres = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    res.json({ genres });
  } catch (err) {
    next(err);
  }
}

export async function getByIds(req, res, next) {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
    if (!ids.length) return res.json({ items: [] });

    const items = await prisma.mediaItem.findMany({ where: { id: { in: ids } } });
    const map = Object.fromEntries(items.map((i) => [i.id, i]));
    const ordered = ids.map((id) => map[id]).filter(Boolean);
    res.json({ items: ordered.map((i) => serializeMedia(i)) });
  } catch (err) {
    next(err);
  }
}

export async function getMediaEnrichment(req, res, next) {
  try {
    const item = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Media not found' });

    if (
      req.user?.childLockEnabled &&
      !canViewMaturity(req.user.maxMaturityRating, item.maturityRating)
    ) {
      return res.status(403).json({ error: 'Content blocked by child lock' });
    }

    const enrichment = await getMediaEnrichmentData(item);
    res.json({ enrichment });
  } catch (err) {
    next(err);
  }
}
