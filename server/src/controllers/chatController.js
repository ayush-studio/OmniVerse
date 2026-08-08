import { prisma } from '../config/db.js';

export async function getHistory(req, res, next) {
  try {
    const roomId = req.query.roomId || `support:${req.user.id}`;
    const isStaff = ['ADMIN', 'SUPPORT_AGENT'].includes(req.user.role);

    const where = isStaff
      ? req.query.roomId
        ? { roomId: String(req.query.roomId) }
        : { roomId: { startsWith: 'support:' } }
      : { roomId };

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
      },
    });

    res.json({ messages, roomId: isStaff ? req.query.roomId || null : roomId });
  } catch (err) {
    next(err);
  }
}

export async function listSupportRooms(req, res, next) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId: { startsWith: 'support:' } },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
      },
    });

    const rooms = {};
    for (const m of messages) {
      if (!rooms[m.roomId]) {
        rooms[m.roomId] = {
          roomId: m.roomId,
          lastMessage: m.message,
          lastAt: m.createdAt,
          unread: 0,
          userId: m.roomId.replace('support:', ''),
        };
      }
      if (!m.isRead && m.sender.role === 'USER') {
        rooms[m.roomId].unread += 1;
      }
    }

    const enriched = await Promise.all(
      Object.values(rooms).map(async (r) => {
        const user = await prisma.user.findUnique({
          where: { id: r.userId },
          select: { id: true, displayName: true, avatarUrl: true, email: true },
        });
        return { ...r, user };
      })
    );

    enriched.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    res.json({ rooms: enriched });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ error: 'roomId required' });
    await prisma.chatMessage.updateMany({
      where: { roomId, isRead: false, NOT: { senderId: req.user.id } },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
