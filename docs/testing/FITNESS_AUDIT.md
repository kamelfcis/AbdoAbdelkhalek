# Fitness Domain Audit

**Date:** 2026-06-04  
**API base:** `http://localhost:4000/api`  
**Coach:** `admin@gmail.com` (validation only)

---

## Public sections (API)

| Section | Endpoint | HTTP | Data | CDN |
|---------|----------|------|------|-----|
| Health | `GET /health` | 200 | OK | — |
| Categories | `GET /categories` | 200 | Array | URLs rewritten when present |
| Videos | `GET /videos` | 200 | Array | Sample thumbnail: `https://pub-353c1e27968842789935db96cbbff77b.r2.dev/...` |
| Packages | `GET /packages` | 200 | Array | — |
| Reviews | `GET /reviews` | 200 | Array | — |
| Success stories | `GET /success-stories` | 200 | Array | — |
| FAQs | `GET /faqs` | 200 | Array | — |

**CDN check:** No `supabase.co/storage` in sampled video thumbnail URL.

---

## UI checklist (manual recommended before go-live)

| Section | Automated | Manual |
|---------|-----------|--------|
| Hero | E2E landing (body content) | RTL, Splide, CTA |
| Categories | — | Grid images, modal |
| Videos | — | Playback modal |
| Packages | — | Pricing display |
| Reviews | — | Carousel |
| Success stories | — | Cards |
| FAQ | — | Accordion |
| Contact | — | Form / links |

---

## Dashboard CRUD (6 entity types)

| Entity | API smoke | UI E2E |
|--------|-----------|--------|
| Categories | POST/PATCH/DELETE via curl + E2E | Create, delete UI; edit via API + list refresh |
| Videos | POST/DELETE E2E API | Manual |
| Packages | POST/DELETE E2E API | Manual |
| Reviews | — | Manual |
| Success stories | — | Manual |
| FAQs | — | Manual |
| Subscriptions | — | Manual |
| Trainees / access | PUT/GET video access PASS | Manual modals |

---

## Access management

```text
PUT /api/videos/:id/access  { userIds: [coachId] }  → 200
GET /api/videos/:id/access                         → includes coachId
PUT /api/videos/:id/access  { userIds: [] }        → 200 (revoke)
```

---

## Issues found

| ID | Severity | Issue | Recommendation |
|----|----------|-------|----------------|
| F1 | Medium | `Package` DB column `level` NOT NULL but missing from Prisma model | Add `level` to `schema.prisma`; `prisma db pull` |
| F2 | Low | Package POST omitted `level` in REST path | **Fixed:** default `beginner` in `createPackage()` |
| F3 | Low | Category images may be empty in API sample | Expected for categories without images |

---

## Recommendations

1. Run manual UX pass on fitness landing (all sections) on staging URL before DNS cutover.  
2. Align Prisma `Package` model with live DB (`level`, `type`, `price_egp`).  
3. Keep `cdnUrl()` middleware active in production with `USE_CDN=true` after DNS.
