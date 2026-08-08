# OmniVerse — Architecture

## Goals

Build a modular entertainment platform that can grow from local SQLite to cloud Postgres without rewriting product features.

## Backend (`server/`)

```
src/
  config/        # env validation, DB client
  controllers/   # HTTP request/response (thin)
  middleware/    # JWT auth, RBAC, rate limits, errors
  routes/        # Express routers by domain
  services/      # Socket.io & cross-cutting runtime
  utils/         # shared helpers (pagination, serializers)
prisma/
  schema.prisma  # data model
  seed.js        # bootstrap users + 500 media rows
```

### Domain modules
- **Auth** — register/login, onboarding, profile, child lock
- **Media** — catalog, search, genres, recommendations, interactions
- **Forum** — posts, nested comments, votes
- **Lists** — user custom lists
- **Chat** — support rooms over Socket.io
- **Notifications** — persisted alerts for support/forum
- **Admin** — stats, users, media CRUD

### Scalability path
1. **Now:** SQLite + single Node process (great for demos)
2. **Next:** Switch Prisma `provider` to `postgresql`, managed DB (Neon/Supabase/RDS)
3. **Then:** Horizontal API replicas behind a load balancer; sticky sessions or Redis adapter for Socket.io
4. **Later:** CDN for SPA assets; object storage for user uploads; read replicas for catalog queries

### Security controls
- Env fail-fast (`JWT_SECRET`, `DATABASE_URL`; prod requires strong secret + `CLIENT_URL`)
- Bcrypt password hashes (never stored plaintext)
- Role checks on admin/support routes
- Rate limits (global + auth)
- Helmet headers; CORS allowlist
- Sanitized 500 responses in production

## Frontend (`client/`)

```
src/
  pages/           # route-level screens
  components/
    ui/            # atoms (Button, Select, EmptyState)
    media/ forum/ chat/ layout/
  services/api.js  # Axios client + domain APIs
  store/           # Zustand (auth, UI, recent, notifications)
  context/         # Socket provider
  utils/           # constants, cn()
```

### UX modules
- Discovery (home, browse, global search)
- Tracking (library statuses, custom lists, continue exploring)
- Community (forums)
- Ops (admin dashboard, live support)

### Scalability notes
- SPA talks only to `/api` (Vite proxy in dev; reverse proxy or `VITE_API_URL` in prod)
- Feature folders keep media/forum/chat isolated for code-splitting later
- Client never holds secrets — only JWT in localStorage (consider httpOnly cookies for stricter deployments)
