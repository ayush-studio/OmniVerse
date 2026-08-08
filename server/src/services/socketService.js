import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { createNotification } from '../controllers/notificationController.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const isStaff = ['ADMIN', 'SUPPORT_AGENT'].includes(user.role);
    const userRoom = `support:${user.id}`;

    socket.join(userRoom);
    socket.join(`user:${user.id}`);
    if (isStaff) socket.join('support:staff');

    socket.emit('connected', { userId: user.id, role: user.role, roomId: userRoom });

    socket.on('join_room', (roomId) => {
      if (isStaff && typeof roomId === 'string' && roomId.startsWith('support:')) {
        socket.join(roomId);
      }
    });

    socket.on('support_message', async (payload, ack) => {
      try {
        const text = String(payload?.message || '').trim();
        if (!text) return ack?.({ error: 'Empty message' });

        let roomId = userRoom;
        if (isStaff && payload?.roomId) {
          roomId = payload.roomId;
        }

        const saved = await prisma.chatMessage.create({
          data: {
            senderId: user.id,
            receiverId: isStaff ? roomId.replace('support:', '') : null,
            roomId,
            message: text,
          },
          include: {
            sender: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
          },
        });

        io.to(roomId).emit('support_message', saved);
        io.to('support:staff').emit('support_notification', {
          roomId,
          message: saved,
        });

        if (isStaff) {
          const targetUserId = roomId.replace('support:', '');
          const notif = await createNotification({
            userId: targetUserId,
            type: 'SUPPORT',
            title: 'Support replied',
            body: text.slice(0, 120),
            link: '/',
          });
          io.to(`user:${targetUserId}`).emit('notification', notif);
        } else {
          const staff = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPPORT_AGENT'] } },
            select: { id: true },
          });
          for (const s of staff) {
            const notif = await createNotification({
              userId: s.id,
              type: 'SUPPORT',
              title: `Chat from ${user.displayName}`,
              body: text.slice(0, 120),
              link: '/admin',
            });
            io.to(`user:${s.id}`).emit('notification', notif);
          }
        }

        ack?.({ ok: true, message: saved });
      } catch (err) {
        ack?.({ error: err.message });
      }
    });

    socket.on('typing', (payload) => {
      const roomId = isStaff && payload?.roomId ? payload.roomId : userRoom;
      socket.to(roomId).emit('typing', {
        userId: user.id,
        displayName: user.displayName,
        roomId,
      });
    });
  });

  return io;
}
