# OmniVerse

**Track. Rate. Discuss.** — a full-stack entertainment aggregator spanning Movies, Series/Anime, Games, Books, Manga, and Music.

```
omniverse/
├── client/     # React (Vite) · Tailwind · Zustand · Socket.io-client
└── server/     # Node/Express · Prisma · JWT · Socket.io
```

---

## What this product does

| Area | Capability |
|------|------------|
| **Discover** | Personalized home, category hubs, global search (Ctrl+K), genre filters |
| **Track** | Favorites, Plan to watch / Completed / On hold / Dropped, custom lists, ratings |
| **Discuss** | Reddit-style forums per title (nested comments, votes, Hot/Top/New) |
| **Persona** | Onboarding wizard — avatar, taste tags, child-lock / maturity filters |
| **Support** | Live Socket.io chat + admin reply inbox + notification bell |
| **Admin** | RBAC (`USER` / `SUPPORT_AGENT` / `ADMIN`), media CRUD, user roles |

---

## Quick start (local)

### Prerequisites
- Node.js 20+
- npm

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run setup          # prisma generate + db push + seed (500 titles)
npm run dev            # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

### Demo accounts (seeded — change in production)
| Role | Name | Email | Password |
|------|------|-------|----------|
| **Curated Profile** | `Chuckle Chieftain` | `chuckle@omniverse.app` | `chuckle123` |
| Admin | `Omni Admin` | `admin@omniverse.app` | `admin123` |
| Support | `Support Agent` | `support@omniverse.app` | `support123` |
| User | `Demo Explorer` | `demo@omniverse.app` | `user123` |

> **Never** reuse these passwords or the sample `JWT_SECRET` in a real deployment.

---

## Architecture (enterprise-oriented)

```
Browser (React SPA)
    │  REST /api/*  +  WebSocket /socket.io
    ▼
Express API  ── JWT auth · RBAC · rate limits · Helmet · CORS allowlist
    │
    ├─ Controllers → Services/handlers → Prisma ORM
    └─ PostgreSQL (prod) / SQLite (local zero-config)
```

**Backend layers:** `routes` → `controllers` → `prisma` + `services` (sockets) · `middleware` (auth, RBAC, rate limit, errors)

**Frontend layers:** `pages` → `components` (feature folders) → `services/api` → `store` (Zustand) · `context` (Socket)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Security baseline

- Passwords hashed with **bcrypt**
- **JWT** bearer tokens (7d); strong `JWT_SECRET` enforced in production
- **Helmet**, CORS locked to `CLIENT_URL`
- **Rate limiting** on `/api` and stricter on `/api/auth`
- Admin routes gated by `role === ADMIN`
- Production error responses do not leak stack traces
- `.env`, SQLite/Postgres data files, and `node_modules` are **gitignored**

---

## Seed catalog

100 movies · 100 games · 100 series · 50 books · 50 manga · 100 albums (70 EN / 30 HI)

Optional poster enrichment:
```bash
cd server
# optional: set TMDB_API_KEY in .env
npm run db:enrich-images
```

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm run setup` | DB + seed |
| `server` | `npm run dev` | API + hot reload |
| `server` | `npm run db:enrich-images` | Refresh cover art |
| `client` | `npm run dev` | Vite SPA |
| `client` | `npm run build` | Production bundle |

---

## License

Private / personal project unless otherwise stated.
