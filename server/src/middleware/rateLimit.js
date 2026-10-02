import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/** General API limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 600 : 5000,
  skip: () => !env.isProd,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

/** Stricter limiter for login/register */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 30 : 5000,
  skip: () => !env.isProd,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});

