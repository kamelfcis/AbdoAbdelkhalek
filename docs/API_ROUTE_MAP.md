# API Route Map

**Last updated:** 2026-06-04 (Phase 4)

## Health

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | — | Service status |
| GET | `/api/squash/health` | — | Squash scaffold only |

## Auth (`/api/auth`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/login` | — | Rate limited; returns `accessToken` + refresh cookie |
| POST | `/signup` | — | Rate limited |
| POST | `/refresh` | Cookie | New access token |
| POST | `/logout` | — | Clears refresh cookie |
| GET | `/me` | Bearer | Current user |

## Fitness content (`/api`)

Public GETs support optional Bearer for trainee/coach views.

| Method | Path | Auth | Coach |
|--------|------|------|-------|
| GET | `/categories` | Optional | — |
| GET | `/videos` | Optional | — |
| GET | `/packages` | — | — |
| GET | `/reviews` | — | — |
| GET | `/success-stories` | — | — |
| GET | `/faqs` | — | — |
| POST/PATCH/DELETE | `/categories`, `/videos`, `/packages`, `/reviews`, `/success-stories`, `/faqs` | Bearer | Yes |
| GET/POST/PATCH/DELETE | `/subscriptions` | Bearer | POST/PATCH/DELETE coach |
| GET | `/trainees` | Bearer | Yes |
| GET | `/stats` | Bearer | Yes |
| GET | `/profile` | Bearer | — |
| GET/PUT | `/videos/:videoId/access` | Bearer | Yes |
| GET/PUT | `/access/trainee/:userId` | Bearer | Yes |

## Uploads (`/api/uploads`)

| Method | Path | Auth | Coach |
|--------|------|------|-------|
| POST | `/presign` | Bearer | Yes; bucket allowlist |
| POST | `/proxy` | Bearer | Yes; multipart `file` |

Allowed buckets: `categories`, `videos`, `video-thumbnails`, `packages`, `reviews`, `success-stories`, `faqs`, `profile`.

## Phase 5 (not implemented)

Squash CRUD will mount under `/api/squash/*` with `squash/` R2 prefix.
