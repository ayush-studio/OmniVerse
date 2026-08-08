import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

if (nodeEnv === 'production') {
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (/omniverse_dev_secret|change_me|secret/i.test(jwtSecret) && jwtSecret.length < 48) {
    throw new Error('JWT_SECRET looks like a default/dev value — set a strong secret before deploying');
  }
  if (!process.env.CLIENT_URL) {
    throw new Error('CLIENT_URL is required in production (your frontend origin)');
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv,
  isProd: nodeEnv === 'production',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
};
