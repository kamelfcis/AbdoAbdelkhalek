# CDN Optimization — Phase 8

**Reference:** [docs/cloudflare-cdn.md](../cloudflare-cdn.md)

## Strategy (no URL breaking changes)

Phase 8 does **not** change CDN hostnames or `mediaUrl()` / `cdnUrl()` logic. Existing env vars remain:

- `USE_CDN` / `REACT_APP_USE_CDN`
- `R2_PUBLIC_URL` / `REACT_APP_R2_PUBLIC_URL`
- `CDN_BASE` / custom domain `cdn.abdelrhmanabdelkhalek.com` (Phase 9 DNS)

## Cache rules (Cloudflare)

| Asset type | Browser cache | CDN edge | Notes |
|------------|---------------|----------|-------|
| Images (R2) | 7d | 30d | Immutable filenames after upload |
| Video files | 1d | 7d | Large objects; prefer poster + lazy load on landing |
| API JSON | no-store | bypass | API not cached at edge |
| CRA `static/js` | 1y (hashed) | 1y | `main.[hash].js` from build |
| CRA `static/css` | 1y (hashed) | 1y | |

## R2 headers (recommended on bucket / custom domain)

```
Cache-Control: public, max-age=31536000, immutable   # versioned assets
Cache-Control: public, max-age=86400               # general images
```

Set via Cloudflare Transform Rules or R2 public bucket metadata when enabling custom domain.

## Frontend media loading (Phase 8)

- `OptimizedImage` — lazy + `srcSet` / `sizes` via `imageOptimizer.js`
- Landing/dashboard images — `loading="lazy"` where below the fold
- Hero — responsive Unsplash widths; Splide deferred chunk
- Video modal — `preload="metadata"`; no autoplay on landing grid

## Verification

```bash
# Confirm CDN helpers still used (no regressions)
rg "cdnUrl|mediaUrl" src/
```

Backend `cdn-urls` middleware continues to rewrite storage paths in API responses.
