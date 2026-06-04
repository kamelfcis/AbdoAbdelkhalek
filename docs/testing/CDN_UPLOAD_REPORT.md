# CDN & Upload Validation Report

**Date:** 2026-06-04

---

## CDN in API responses

| Check | Result |
|-------|--------|
| Fitness video thumbnail sample | `https://pub-353c1e27968842789935db96cbbff77b.r2.dev/video-thumbnails/...` |
| Supabase storage URLs in sample | **None** |
| Production CDN hostname | `cdn.abdelrhmanabdelkhalek.com` — DNS pending (Phase 9) |

Middleware: `cdn-urls` rewrites media fields on API responses per [docs/cloudflare-cdn.md](../cloudflare-cdn.md).

---

## Upload allowlists

**Fitness buckets** (`backend/src/domains/shared/media/allowlist.ts`):

- `categories`, `videos`, `video-thumbnails`, `packages`, `reviews`, `success-stories`, `faqs`, `profile`

**Squash key prefixes:**

- `squash/categories/`, `squash/videos/`, `squash/video-thumbnails/`, `squash/packages/`, `squash/reviews/`, `squash/success-stories/`, `squash/faqs/`, `squash/coaches/`, `squash/programs/`

---

## Upload endpoints

| Method | Path | Auth | Validated |
|--------|------|------|-----------|
| POST | `/api/uploads/presign` | Coach | 401 without token (Phase 7 integration) |
| POST | `/api/uploads/proxy` | Coach multipart | **Not run** (small-file test deferred) |

**Proxy test procedure (manual):**

```powershell
# Coach JWT required; small PNG < 100KB
curl -X POST http://localhost:4000/api/uploads/proxy `
  -H "Authorization: Bearer $TOKEN" `
  -F "file=@test.png" `
  -F "bucket=categories" `
  -F "path=test/e2e.png"
```

Expect `publicUrl` matching `pub-*.r2.dev` or `CDN_BASE_URL`.

---

## Issues

| ID | Issue | Severity |
|----|-------|----------|
| C1 | `USE_CDN=false` in dev — R2 dev URL used | Low (expected) |
| C2 | Proxy upload not exercised in automation | Low |

---

## Recommendations

1. Enable `USE_CDN=true` + `R2_PUBLIC_URL` / CDN DNS before production.  
2. Add optional E2E proxy upload with 1×1 PNG fixture (future).  
3. Review R2 bucket public-read policy before go-live.
