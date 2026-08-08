import { prisma } from '../config/db.js';
import { serializeMedia } from '../utils/helpers.js';

export async function listLists(req, res, next) {
  try {
    const lists = await prisma.customList.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { items: true } },
        items: {
          take: 4,
          orderBy: { createdAt: 'desc' },
          include: { media: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      lists: lists.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        itemCount: l._count.items,
        preview: l.items.map((i) => serializeMedia(i.media)),
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createList(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Name required' });

    const list = await prisma.customList.create({
      data: {
        userId: req.user.id,
        name,
        description: String(req.body.description || '').trim(),
      },
    });
    res.status(201).json({ list: { ...list, itemCount: 0, preview: [] } });
  } catch (err) {
    next(err);
  }
}

export async function getList(req, res, next) {
  try {
    const list = await prisma.customList.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: { media: true },
        },
      },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });

    res.json({
      list: {
        id: list.id,
        name: list.name,
        description: list.description,
        items: list.items.map((i) => serializeMedia(i.media)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteList(req, res, next) {
  try {
    const list = await prisma.customList.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });
    await prisma.customList.delete({ where: { id: list.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function addToList(req, res, next) {
  try {
    const { mediaId } = req.body;
    if (!mediaId) return res.status(400).json({ error: 'mediaId required' });

    const list = await prisma.customList.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });

    const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    await prisma.customListItem.upsert({
      where: { listId_mediaId: { listId: list.id, mediaId } },
      create: { listId: list.id, mediaId },
      update: {},
    });
    await prisma.customList.update({
      where: { id: list.id },
      data: { updatedAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function removeFromList(req, res, next) {
  try {
    const list = await prisma.customList.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!list) return res.status(404).json({ error: 'List not found' });

    await prisma.customListItem.deleteMany({
      where: { listId: list.id, mediaId: req.params.mediaId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
