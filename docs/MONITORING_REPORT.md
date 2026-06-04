# Monitoring & Operations Report — Phase 9

**Date:** 2026-06-04

---

## 1. Health endpoints

| Endpoint | Response | Verified |
|----------|----------|----------|
| `GET /api/health` | `{"ok":true,"service":"abdelrhmanabdelkhalek-api"}` | Local **PASS** |
| `GET /api/squash/health` | Squash domain marker | Backend test suite |

**Production monitoring (operator):**

- UptimeRobot / Better Stack / Cloudflare Health Check → `https://api.<domain>/api/health` every 1–5 min
- Alert on non-200 or timeout > 10s

---

## 2. Logging (implemented)

| Feature | Location |
|---------|----------|
| Structured JSON logs | `backend/src/infrastructure/logging/` |
| Request ID | `request-id` middleware |
| Per-request log | method, path, status, `durationMs` |

**Production:** Ship stdout to host logs (Railway/Render built-in) or forward to Datadog/Logtail.

---

## 3. Error tracking (optional — not wired)

No Sentry SDK in codebase today. Suggested env placeholders in `backend/.env.production.example`:

```
# SENTRY_DSN=
# SENTRY_ENVIRONMENT=production
```

**Future:** `@sentry/node` in `createApp()` error handler + CRA `@sentry/react` for client 5xx.

---

## 4. Backup schedule

| Source | Method | Frequency |
|--------|--------|-----------|
| Postgres | Supabase dashboard backup or `pg_dump` cron | Daily + before cutover |
| R2 | Versioning / lifecycle (Cloudflare setting) | Optional |
| Env secrets | Password manager / CI vault | On change |

See `docs/backup/BACKUP_STRATEGY.md`, `docs/BACKUP_AND_RESTORE_REPORT.md`, `backups/README.md`.

---

## 5. Metrics (recommended post go-live)

| Metric | Tool |
|--------|------|
| API latency p95 | Host metrics or APM |
| 5xx rate | Log aggregation |
| DB connections | Postgres provider dashboard |
| R2 egress | Cloudflare analytics |

---

## 6. Runbook links

| Action | Doc |
|--------|-----|
| Deploy frontend | `docs/VERCEL_DEPLOYMENT.md` |
| Deploy API | `docs/PHASE9_DEPLOYMENT_PLAN.md` §4 |
| Rollback | `docs/CUTOVER_CHECKLIST.md` |
| CDN issue | `docs/cloudflare-cdn.md` |

---

## 7. Verification checklist

- [x] Health route exists and returns JSON
- [x] Request logging active (local backend:dev observed)
- [ ] External monitor configured on production URL
- [ ] Backup cron or Supabase schedule confirmed
- [ ] On-call / operator contact for 48h post go-live
