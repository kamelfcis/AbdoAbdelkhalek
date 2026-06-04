# Backend API

Express + TypeScript + Prisma + Supabase REST fallback + Cloudflare R2.

## Structure (Phase 4)

```
src/
├── index.ts                 # Entry — starts HTTP server
├── app/server.ts            # Express app factory, middleware, route mounts
├── config/env.ts
├── domains/
│   ├── fitness/             # Public + coach CRUD at /api/*
│   ├── squash/              # Scaffold at /api/squash (Phase 5)
│   └── shared/
│       ├── auth/            # /api/auth/*
│       └── media/           # /api/uploads/*
├── infrastructure/
│   ├── prisma/              # Client, reads/writes, pooler errors
│   ├── supabase-rest/       # PostgREST fallback
│   ├── r2/                  # S3-compatible uploads
│   └── logging/
└── common/
    ├── validation/          # Zod schemas
    ├── errors/              # AppError + handler
    ├── middleware/          # auth, CDN rewrite, validate
    └── utils/               # case-map, cdn-url
```

Legacy `lib/` and `middleware/` paths re-export from the new layout for scripts and gradual migration.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run build` | `tsc` → `dist/` |
| `npm run start` | `node dist/index.js` |

From repo root: `npm run backend:dev`, `npm run backend:build`.

## Environment

Copy `backend/.env.example` → `backend/.env`. See [docs/DATA_LAYER.md](../docs/DATA_LAYER.md) and [docs/SECURITY.md](../docs/SECURITY.md).

## API map

See [docs/API_ROUTE_MAP.md](../docs/API_ROUTE_MAP.md).
