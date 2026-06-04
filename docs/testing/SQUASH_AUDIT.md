# Squash Domain Audit

**Date:** 2026-06-04  
**API base:** `http://localhost:4000/api/squash`  
**Frontend:** `REACT_APP_DOMAIN=squash` or `squash-landing` Playwright project

---

## Public API (all verified 200)

| Endpoint | Status |
|----------|--------|
| `GET /api/squash/categories` | 200 |
| `GET /api/squash/videos` | 200 |
| `GET /api/squash/packages` | 200 |
| `GET /api/squash/reviews` | 200 |
| `GET /api/squash/success-stories` | 200 |
| `GET /api/squash/faqs` | 200 |
| `GET /api/squash/coaches` | 200 |
| `GET /api/squash/programs` | 200 |

---

## Dashboard entities (8)

| Entity | API | Notes |
|--------|-----|-------|
| Categories | Phase 5 smoke PASS | |
| Videos | Seeded | Access API PASS |
| Packages | GET PASS | |
| Reviews | GET PASS | |
| Success stories | GET PASS | |
| FAQs | GET PASS | |
| Coaches | GET PASS | |
| Programs | GET PASS | |

Coach category CRUD cycle documented in [PHASE5_COMPLETION_REPORT.md](../PHASE5_COMPLETION_REPORT.md).

---

## UI

| Check | Result |
|-------|--------|
| Squash landing E2E | PASS (body text > 50 chars) |
| Subdomain `squash.abdelrhmanabdelkhalek.com` | Not tested locally — DNS Phase 9 |
| Dashboard domain switch | Manual on staging |

---

## Media paths

Upload allowlist prefixes: `squash/categories/`, `squash/videos/`, … `squash/programs/` (see [CDN_UPLOAD_REPORT.md](./CDN_UPLOAD_REPORT.md)).

---

## Issues

| ID | Severity | Issue | Action |
|----|----------|-------|--------|
| S1 | Info | Squash landing needs `REACT_APP_DOMAIN=squash` or dedicated Playwright project | Documented in README / E2E |
| S2 | None | Access tables | Already on `ugscjqusyjttihnfhtuk` |

---

## Recommendations

1. Configure DNS `squash.abdelrhmanabdelkhalek.com` → frontend host (Phase 9).  
2. Staging smoke: repeat 8 public GETs + one squash category CRUD after deploy.
