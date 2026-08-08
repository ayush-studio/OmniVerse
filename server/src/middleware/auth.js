import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Never attach password hashes to request consumers beyond controllers that need them
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (user) req.user = user;
    }
  } catch {
    // ignore invalid optional tokens
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function requireSupport(req, res, next) {
  if (!req.user || !['ADMIN', 'SUPPORT_AGENT'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Support access required' });
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || err.statusCode || 500;

  // Avoid leaking stack traces / internal details in production
  const message =
    status >= 500 && env.isProd
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
}
