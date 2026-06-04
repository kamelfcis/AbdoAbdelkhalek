# Abdelrahman Abdelkhalek — Performance Coach Platform

React landing site and coach dashboard for a fitness coaching business. The frontend talks to a custom **Express API** (JWT auth, Prisma/Postgres, Cloudflare R2 uploads). Public content is cached with **TanStack Query**.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router, TanStack Query, Tailwind CSS |
| Backend | Express, Prisma, Zod, JWT (access + httpOnly refresh cookie) |
| Database | Supabase Postgres (interim) with PostgREST fallback — see [docs/DATA_LAYER.md](./docs/DATA_LAYER.md) |
| Media | Cloudflare R2 + CDN — see [docs/cloudflare-cdn.md](./docs/cloudflare-cdn.md) |
| Auth | `AuthContext`, `ProtectedRoute`, `CoachRoute` — coach dashboard at `/dashboard` |

## Features

- Multi-language (English / Arabic) with RTL
- Coach dashboard: categories, videos, packages, reviews, FAQs, trainees, subscriptions
- Role-based access (coach vs trainee vs public)
- REST API fallback when Supabase pooler is unreachable in dev

## Local development

### 1. Environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Fill in real values in both files. The backend loads **root `.env` first**, then `backend/.env` (overrides).

| File | Purpose |
|------|---------|
| [`.env.example`](./.env.example) | Frontend (`REACT_APP_*`), shared DB/R2/JWT vars, migration toolkit |
| [`backend/.env.example`](./backend/.env.example) | API-focused subset; same JWT/DB/R2 keys |

Required for API: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. See [docs/SECURITY.md](./docs/SECURITY.md) for production requirements.

### 2. Install

```bash
npm install
```

Monorepo workspaces: `backend`, `migration-toolkit`.

### 3. Run

Terminal 1 — API (default port 4000):

```bash
npm run backend:dev
```

Terminal 2 — frontend (port 3000):

```bash
npm start
```

Set `REACT_APP_API_URL=http://localhost:4000/api` in `.env`.

### 4. Build

```bash
npm run build          # frontend → build/
npm run backend:build  # backend tsc → backend/dist/
```

## Project structure

```
src/
├── components/       # Landing + shared UI
├── contexts/         # AuthContext, LanguageContext
├── features/auth/    # Auth helpers (if split from contexts)
├── hooks/            # TanStack Query hooks
├── lib/queryKeys.js  # Canonical query keys + invalidation
├── pages/            # Login, Dashboard, dashboard modals
├── services/         # apiClient, auth API
└── config/           # queryClient.js

backend/
├── src/
│   ├── modules/auth/     # Login, signup, refresh
│   ├── modules/content/  # Public + coach CRUD
│   ├── lib/              # Prisma + REST fallback
│   └── config/env.ts
└── prisma/schema.prisma

docs/
├── DATA_LAYER.md
├── SECURITY.md
└── progress/PHASE1_PROGRESS.md
```

Data fetching on the landing page and dashboard goes through `src/services/apiClient.js` → Express API (not a browser Supabase client).

## Documentation

- [ROADMAP.md](./ROADMAP.md) — multi-phase platform plan
- [PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md) — task tracker
- [docs/DATA_LAYER.md](./docs/DATA_LAYER.md) — Prisma + REST fallback, pooler troubleshooting
- [docs/SECURITY.md](./docs/SECURITY.md) — JWT, password migration, env audit
- [migration-toolkit/README.md](./migration-toolkit/README.md) — Supabase → Postgres/R2 migration

## Production build

```bash
npm run build
npm run backend:build
```

Serve `build/` with any static host; run the API with `NODE_ENV=production` and strong `JWT_*` secrets. Set `CORS_ORIGIN` to your frontend origin.
