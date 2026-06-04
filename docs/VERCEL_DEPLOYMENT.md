# Vercel Deployment Guide (CRA + React Router SPA)

**Date:** 2026-06-04  
**Build:** Create React App (`react-scripts build`) → output `build/`  
**Routing:** `BrowserRouter` — requires SPA fallback (`vercel.json` rewrites).

---

## 1. Prerequisites

- GitHub repo connected to Vercel (or Vercel CLI logged in)
- Production API URL (e.g. `https://api.abdelrhmanabdelkhalek.com/api`)
- CDN hostname working (`cdn.abdelrhmanabdelkhalek.com` — verified 200 on sample object)
- **Two Vercel projects** recommended: one for fitness, one for squash (different `REACT_APP_DOMAIN`)

---

## 2. Repository config

### `vercel.json` (repo root)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Ensures `/dashboard`, `/login`, and client routes do not 404 on refresh.

### Optional security headers (not in repo — add in Vercel if desired)

Project → Settings → Headers, or extend `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Backend already uses `helmet()` for API responses.

---

## 3. Vercel project settings

| Setting | Value |
|---------|-------|
| Framework Preset | Create React App |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |
| Node.js Version | 20.x (LTS) |

---

## 4. Environment variables

CRA inlines only `REACT_APP_*` at **build** time. Set in Vercel → Settings → Environment Variables → **Production** (and Preview if needed).

### Required

| Variable | Fitness example | Squash example |
|----------|-----------------|----------------|
| `REACT_APP_API_URL` | `https://api.abdelrhmanabdelkhalek.com/api` | same |
| `REACT_APP_DOMAIN` | `fitness` | `squash` |
| `DISABLE_ESLINT_PLUGIN` | `true` | `true` |
| `CI` | `false` | `false` |

### Media / CDN

| Variable | When | Notes |
|----------|------|-------|
| `REACT_APP_USE_CDN` | `true` after CDN smoke | Must match backend `USE_CDN` |
| `REACT_APP_CDN_URL` | `https://cdn.abdelrhmanabdelkhalek.com` | Custom domain |
| `REACT_APP_R2_PUBLIC_URL` | Optional fallback | `pub-*.r2.dev` while testing |
| `REACT_APP_MEDIA_BASE_URL` | Optional alias | Same as R2 public if used |
| `REACT_APP_SUPABASE_URL` | Legacy rewrite base | From `.env.example` |

### Upload / API mode

| Variable | Default | Notes |
|----------|---------|-------|
| `REACT_APP_UPLOAD_VIA_API` | `true` in prod | Proxy upload via backend |
| `REACT_APP_USE_API` | unset (= true) | Set `false` only to force Supabase client |

### Not in `.env.example` but used in code

| Variable | Purpose |
|----------|---------|
| `REACT_APP_USE_API` | `src/services/index.js` — API vs legacy |

Templates: `.env.production.example` (fitness), `.env.production.squash.example` (squash).

---

## 5. Domain mapping

### Project A — Fitness

| Host | Type |
|------|------|
| `abdelrhmanabdelkhalek.com` | Primary |
| `www.abdelrhmanabdelkhalek.com` | Redirect to apex (Vercel setting) |

Env: `REACT_APP_DOMAIN=fitness` (or omit — hostname without `squash.` resolves fitness).

### Project B — Squash

| Host | Type |
|------|------|
| `squash.abdelrhmanabdelkhalek.com` | Primary |

Env: **`REACT_APP_DOMAIN=squash`** (required — hostname override for build).

---

## 6. Deploy commands (CLI)

**Do not run unless `vercel login` completed.**

```powershell
# Install CLI once
npm i -g vercel

# Fitness (from repo root)
vercel link
vercel env pull .env.vercel.local   # optional
vercel --prod

# Squash — second project linked to squash subdomain
# Set REACT_APP_DOMAIN=squash in Vercel dashboard before:
vercel --prod
```

Prefer **Git integration**: push to `main` → automatic production deploy when env vars are set.

---

## 7. Post-deploy verification

1. Open `https://abdelrhmanabdelkhalek.com` — fitness hero loads.
2. Open `https://squash.abdelrhmanabdelkhalek.com` — squash hero loads.
3. Hard-refresh `/dashboard` and `/login` — no 404 (rewrite test).
4. Network tab: API calls go to `REACT_APP_API_URL`.
5. Image URLs use `cdn.*` or `pub-*.r2.dev` per env.
6. Coach login + one CRUD action.

See `docs/VERCEL_CHECKLIST.md`.

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | Confirm `vercel.json` rewrites committed |
| API CORS error | Update backend `CORS_ORIGIN` with exact Vercel URLs |
| Wrong site (squash on main) | Separate projects; `REACT_APP_DOMAIN=squash` on squash project only |
| Old API URL in bundle | Rebuild after env change (CRA bakes env at build) |
| ESLint fails build | `DISABLE_ESLINT_PLUGIN=true` |

---

## 9. References

- `docs/PHASE9_DEPLOYMENT_PLAN.md` — full stack
- `docs/cloudflare-cdn.md` — CDN env pairing
- `.env.example` — all root env names
- `docs/VERCEL_CHECKLIST.md` — step-by-step sign-off
