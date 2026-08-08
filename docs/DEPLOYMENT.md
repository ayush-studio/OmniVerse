# Deployment guide

## Before you deploy

1. Generate a strong JWT secret:
   ```bash
   # PowerShell
   [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
   ```
2. Provision **PostgreSQL** (recommended for production). Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set server env (host secrets manager / platform env vars — never commit):
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=<long random>
   CLIENT_URL=https://your-frontend.com
   PORT=5000
   ```
4. Change or delete seed demo users after first login, or skip seeding and create an admin manually.

## Backend (API)

```bash
cd server
npm ci
npx prisma migrate deploy   # or: npx prisma db push
# optional: node prisma/seed.js
npm start
```

### Platform ideas
- **Render / Railway / Fly.io / Azure App Service** — run `server` as a Node web service
- Attach managed Postgres
- Enable WebSockets for Socket.io support chat

## Frontend (SPA)

```bash
cd client
npm ci
npm run build
```

Serve `client/dist` via:
- Netlify / Vercel / Cloudflare Pages, **or**
- Nginx / CDN pointing at the static files

Set the API base URL for production builds. Easiest options:

**A. Same domain reverse proxy** (recommended)
```
https://omniverse.app/        → static SPA
https://omniverse.app/api     → Node API
https://omniverse.app/socket.io → Node
```
Keep Axios `baseURL: '/api'` (already configured).

**B. Separate API host**
Add `VITE_API_URL` and point Axios at it; update CORS `CLIENT_URL` on the server.

## Checklist

- [ ] `.env` not in git
- [ ] Strong `JWT_SECRET`
- [ ] `CLIENT_URL` matches real frontend origin
- [ ] HTTPS everywhere
- [ ] Demo passwords rotated
- [ ] Database backups enabled
- [ ] Health check: `GET /api/health`
- [ ] Socket.io works through your proxy (WebSocket upgrade)

## Local vs production DB

| | Local | Production |
|--|-------|------------|
| Provider | SQLite (`file:./dev.db`) | PostgreSQL |
| Seed | `npm run setup` | Optional / controlled |
| Secrets | `.env` (gitignored) | Host env vars |
