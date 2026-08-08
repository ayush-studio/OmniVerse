import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

function parseJson(value, fallback = {}) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value ?? fallback;
  } catch {
    return fallback;
  }
}

function serializeUser(user) {
  const { passwordHash, childLockPinHash, ...rest } = user;
  return {
    ...rest,
    tasteProfile: parseJson(user.tasteProfile, { genres: [], formats: [] }),
    hasChildLockPin: Boolean(childLockPinHash),
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (String(displayName).trim().length < 2) {
      return res.status(400).json({ error: 'Display name is too short' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        displayName: String(displayName).trim().slice(0, 60),
      },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: (email || '').toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function completeOnboarding(req, res, next) {
  try {
    const {
      avatarUrl,
      favoriteQuote,
      tasteProfile,
      childLockEnabled,
      childLockPin,
      maxMaturityRating,
    } = req.body;

    const data = {
      onboardingComplete: true,
      avatarUrl: avatarUrl || null,
      favoriteQuote: favoriteQuote || null,
      tasteProfile: JSON.stringify(tasteProfile || { genres: [], formats: [] }),
      childLockEnabled: Boolean(childLockEnabled),
      maxMaturityRating: maxMaturityRating || 'ADULT_18',
    };

    if (childLockEnabled && childLockPin) {
      data.childLockPinHash = await bcrypt.hash(String(childLockPin), 10);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { displayName, avatarUrl, favoriteQuote, tasteProfile, maxMaturityRating } = req.body;
    const data = {};
    if (displayName !== undefined) data.displayName = displayName;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (favoriteQuote !== undefined) data.favoriteQuote = favoriteQuote;
    if (tasteProfile !== undefined) data.tasteProfile = JSON.stringify(tasteProfile);
    if (maxMaturityRating !== undefined) data.maxMaturityRating = maxMaturityRating;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function setChildLock(req, res, next) {
  try {
    const { enabled, pin } = req.body;
    const data = { childLockEnabled: Boolean(enabled) };
    if (enabled && pin) {
      data.childLockPinHash = await bcrypt.hash(String(pin), 10);
    }
    if (!enabled) {
      data.childLockPinHash = null;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export { serializeUser };
