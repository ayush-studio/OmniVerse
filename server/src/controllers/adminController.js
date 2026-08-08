import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { serializeMedia, parseJson, paginate } from '../utils/helpers.js';
import { serializeUser } from './authController.js';

export async function dashboardStats(_req, res, next) {
  try {
    const [users, media, posts, messages] = await Promise.all([
      prisma.user.count(),
      prisma.mediaItem.count(),
      prisma.forumPost.count(),
      prisma.chatMessage.count(),
    ]);

    const byType = await prisma.mediaItem.groupBy({
      by: ['type'],
      _count: { _all: true },
    });

    res.json({
      stats: {
        users,
        media,
        posts,
        messages,
        byType: Object.fromEntries(byType.map((b) => [b.type, b._count._all])),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const { skip, take, page: p, limit: l } = paginate({ page, limit: limit || 30 });
    const where = search
      ? {
          OR: [
            { email: { contains: String(search) } },
            { displayName: { contains: String(search) } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(serializeUser),
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN', 'SUPPORT_AGENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function createMedia(req, res, next) {
  try {
    const {
      title,
      type,
      genreTags = [],
      summary,
      boxOfficeOrRank = 0,
      coverImageUrl,
      bannerImageUrl,
      releaseYear,
      language = 'English',
      maturityRating = 'PG13',
      metadata = {},
      averageRating = 7.5,
    } = req.body;

    if (!title || !type || !summary || !releaseYear) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = await prisma.mediaItem.create({
      data: {
        title,
        type: String(type).toUpperCase(),
        genreTags: JSON.stringify(genreTags),
        summary,
        boxOfficeOrRank: BigInt(boxOfficeOrRank || 0),
        coverImageUrl:
          coverImageUrl ||
          `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`,
        bannerImageUrl:
          bannerImageUrl ||
          `https://picsum.photos/seed/${encodeURIComponent(title)}-banner/1400/500`,
        releaseYear: Number(releaseYear),
        language,
        maturityRating,
        metadata: JSON.stringify(metadata),
        averageRating: Number(averageRating) || 0,
      },
    });

    res.status(201).json({ item: serializeMedia(item) });
  } catch (err) {
    next(err);
  }
}

export async function updateMedia(req, res, next) {
  try {
    const existing = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const data = { ...req.body };
    if (data.genreTags) data.genreTags = JSON.stringify(data.genreTags);
    if (data.metadata) data.metadata = JSON.stringify(data.metadata);
    if (data.type) data.type = String(data.type).toUpperCase();
    if (data.boxOfficeOrRank !== undefined) data.boxOfficeOrRank = BigInt(data.boxOfficeOrRank || 0);
    delete data.id;

    const item = await prisma.mediaItem.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ item: serializeMedia(item) });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req, res, next) {
  try {
    await prisma.mediaItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function bulkImportMedia(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items array required' });
    }

    const created = [];
    for (const raw of items) {
      if (!raw.title || !raw.type || !raw.summary || !raw.releaseYear) continue;
      const item = await prisma.mediaItem.create({
        data: {
          title: raw.title,
          type: String(raw.type).toUpperCase(),
          genreTags: JSON.stringify(raw.genreTags || []),
          summary: raw.summary,
          boxOfficeOrRank: BigInt(raw.boxOfficeOrRank || 0),
          coverImageUrl:
            raw.coverImageUrl ||
            `https://picsum.photos/seed/${encodeURIComponent(raw.title)}/400/600`,
          bannerImageUrl:
            raw.bannerImageUrl ||
            `https://picsum.photos/seed/${encodeURIComponent(raw.title)}-b/1400/500`,
          releaseYear: Number(raw.releaseYear),
          language: raw.language || 'English',
          maturityRating: raw.maturityRating || 'PG13',
          metadata: JSON.stringify(raw.metadata || {}),
          averageRating: Number(raw.averageRating) || 7.5,
        },
      });
      created.push(serializeMedia(item));
    }

    res.status(201).json({ count: created.length, items: created });
  } catch (err) {
    next(err);
  }
}

export async function listForumPostsAdmin(req, res, next) {
  try {
    const { page, limit } = req.query;
    const { skip, take, page: p, limit: l } = paginate({ page, limit: limit || 30 });
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, displayName: true } },
          media: { select: { id: true, title: true } },
        },
      }),
      prisma.forumPost.count(),
    ]);
    res.json({
      posts,
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteForumPostAdmin(req, res, next) {
  try {
    await prisma.forumPost.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function resetAdminPassword(_req, res, next) {
  try {
    // utility no-op safeguard — not exposed by default
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export { parseJson, bcrypt };
