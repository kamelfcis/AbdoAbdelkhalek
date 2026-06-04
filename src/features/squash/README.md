# Squash feature (Phase 3 scaffold)

Placeholder public sections and routing hook via `useDomain()` / `REACT_APP_DOMAIN=squash`.

**Phase 5:** Full sections, Prisma models, `/api/squash/*` CRUD.

**Local dev:**

1. **Recommended:** `npm run backend:dev` — starts API + frontend; open `http://localhost:3000/` for the portal, then choose Squash or Fitness.
2. API only: `npm run backend:api` (port 4000).
3. Frontend only: `npm run start` (portal at `/`) or `npm run start:squash` (squash theme; landings at `/squash` and `/fitness`).
4. Optional hosts: `127.0.0.1 squash.local` → `http://squash.local:3000/squash`.
