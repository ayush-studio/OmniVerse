import { prisma } from '../config/db.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
    const unread = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ notifications, unread });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const { ids, all } = req.body || {};
    if (all) {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (Array.isArray(ids) && ids.length) {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, id: { in: ids } },
        data: { isRead: true },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function createNotification({ userId, type, title, body, link }) {
  if (!userId) return null;
  return prisma.notification.create({
    data: { userId, type, title, body, link: link || null },
  });
}
