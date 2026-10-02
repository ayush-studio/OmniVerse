import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/auth.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { initSocket } from './services/socketService.js';

import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import listRoutes from './routes/listRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);

if (env.isProd) {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.isProd ? undefined : false,
  })
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (!env.isProd) return true;
  if (origin === env.clientUrl) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app') || hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);


app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'OmniVerse API', time: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

initSocket(server);

server.listen(env.port, () => {
  console.log(`OmniVerse API running on http://localhost:${env.port} [${env.nodeEnv}]`);
});
