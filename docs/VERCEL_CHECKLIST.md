# Vercel Deployment Checklist

**Date:** 2026-06-04  
Use for **each** Vercel project (Fitness + Squash). Mark `[x]` only when verified.

---

## Pre-flight (repo — verified 2026-06-04)

- [x] `vercel.json` SPA rewrites present
- [x] `npm run build` PASS locally
- [x] `docs/VERCEL_DEPLOYMENT.md` complete
- [x] `.env.production.example` / `.env.production.squash.example` committed
- [ ] Vercel account + GitHub repo connected

---

## Project: Fitness (`abdelrhmanabdelkhalek.com`)

### Create project

- [ ] Import Git repository
- [ ] Framework: Create React App
- [ ] Build: `npm run build`, Output: `build`

### Environment (Production)

- [ ] `REACT_APP_API_URL` → production API `/api`
- [ ] `REACT_APP_DOMAIN` = `fitness`
- [ ] `REACT_APP_USE_CDN` = `true` (after CDN smoke)
- [ ] `REACT_APP_CDN_URL` = `https://cdn.abdelrhmanabdelkhalek.com`
- [ ] `REACT_APP_UPLOAD_VIA_API` = `true`
- [ ] `DISABLE_ESLINT_PLUGIN` = `true`
- [ ] `CI` = `false`

### Domains

- [ ] Add `abdelrhmanabdelkhalek.com`
- [ ] Add `www` → redirect to apex
- [ ] SSL certificate issued (automatic)

### Deploy

- [ ] Trigger production deploy
- [ ] Build log green
- [ ] Site loads — fitness hero
- [ ] `/login` refresh — no 404
- [ ] API requests succeed (CORS configured on backend)

---

## Project: Squash (`squash.abdelrhmanabdelkhalek.com`)

### Create project

- [ ] **Separate** Vercel project (do not share fitness env)
- [ ] Same build settings as fitness

### Environment (Production)

- [ ] `REACT_APP_API_URL` → same API URL
- [ ] **`REACT_APP_DOMAIN` = `squash`** (critical)
- [ ] CDN vars same as fitness project
- [ ] `DISABLE_ESLINT_PLUGIN`, `CI` as above

### Domains

- [ ] Add `squash.abdelrhmanabdelkhalek.com`
- [ ] SSL automatic

### Deploy

- [ ] Production deploy green
- [ ] Squash landing loads (not fitness)
- [ ] Dashboard routes work for squash coach flows

---

## Backend coordination (not Vercel)

- [ ] API live at `api.*` with `CORS_ORIGIN` including both frontends
- [ ] `USE_CDN=true` on API when enabling `REACT_APP_USE_CDN=true`
- [ ] JWT secrets rotated for production

---

## Sign-off

| Role | Date | OK |
|------|------|-----|
| Dev | | |
| Operator | | |

**READY_FOR_IMPLEMENTATION:** YES (repo artifacts)  
**GO_LIVE (Vercel):** NO until all unchecked boxes above are done in dashboard.
