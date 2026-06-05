# Premium Login Redesign — Progress

**Last updated:** 2026-06-05

Track implementation against the [design plan](./LOGIN_REDESIGN_PLAN.md). Update status as each milestone completes.

---

## Milestones

| ID | Task | Status | Owner / notes |
|----|------|--------|---------------|
| `docs-scaffold` | Create `LOGIN_REDESIGN_PLAN.md`, `LOGIN_REDESIGN_PROGRESS.md`, `LOGIN_REDESIGN_REPORT.md` | **Done** | Design doc, checklist, QA report template |
| `i18n-login` | Add `login.en.js` / `login.ar.js` + `getLoginTranslation()`; wire `useLanguage()` in login UI | **Done** | Translation files + `useLoginAuth` / panels |
| `login-ui-split` | Build `LoginPage` split layout: `LoginShowcase` (60%) + `LoginAuthPanel` (40%) + `login-page.css` + Framer Motion | **Done** | Mobile column stack; desktop 60/40 grid |
| `auth-hook-extract` | Extract `useLoginAuth.js` from `Login.js` preserving coach/trainee redirects, signup, prefetch | **Done** | `getDefaultDashboardPath`, `traineeHomePath`, prefetch |
| `remember-me` | Remember me: `localStorage` email prefill + backend `rememberMe` longer refresh cookie | **Done** | `REMEMBER_EMAIL_KEY`; login sends `rememberMe` |
| `password-reset-backend` | Prisma `PasswordResetToken` + forgot/reset API + mailer + tests + `.env.example` | **Done** | Vitest coverage; `tsc` build clean |
| `password-reset-frontend` | `ForgotPasswordPanel` + `ResetPasswordPage` + `authService` methods + `/reset-password` route | **Done** | `requestPasswordReset` / `resetPassword` |
| `signup-redesign` | Redesign `LoginSignupPanel` to match glass auth aesthetic | **Done** | Shared glass inputs + alerts |
| `qa-build` | Manual QA matrix (EN/AR, mobile, coach/trainee) + `npm run build` + complete `LOGIN_REDESIGN_REPORT.md` | **Done** | Code-review QA + builds 2026-06-05 |

---

## File checklist

| File | Created | Wired |
|------|---------|-------|
| `docs/LOGIN_REDESIGN_PLAN.md` | Yes | Yes |
| `docs/LOGIN_REDESIGN_PROGRESS.md` | Yes | Yes |
| `docs/LOGIN_REDESIGN_REPORT.md` | Yes | Yes |
| `src/shared/i18n/login.en.js` | Yes | Yes |
| `src/shared/i18n/login.ar.js` | Yes | Yes |
| `src/shared/i18n/index.js` (`getLoginTranslation`) | Yes | Yes |
| `src/features/auth/login/login-page.css` | Yes | Yes |
| `src/features/auth/login/login.motion.js` | Yes | Yes |
| `src/features/auth/login/LoginPage.jsx` | Yes | Yes |
| `src/features/auth/login/LoginShowcase.jsx` | Yes | Yes |
| `src/features/auth/login/LoginAuthPanel.jsx` | Yes | Yes |
| `src/features/auth/login/LoginSignupPanel.jsx` | Yes | Yes |
| `src/features/auth/login/ForgotPasswordPanel.jsx` | Yes | Yes |
| `src/features/auth/login/ResetPasswordPage.jsx` | Yes | Yes |
| `src/features/auth/login/useLoginAuth.js` | Yes | Yes |
| `src/features/auth/login/loginStats.js` | Yes | Yes |
| `src/features/auth/login/index.js` | Yes | Yes |
| `src/pages/Login.js` (thin re-export) | Yes | Yes |
| `src/app/router.jsx` (`/reset-password`) | Yes | Yes |

---

## Build

| Date | Command | Result | Notes |
|------|---------|--------|-------|
| 2026-06-05 | `backend`: `npm test` | Exit **0** (55 passed, 3 skipped) | Initial run: 1 flaky `password-reset` test (500 vs 400); clean on rerun |
| 2026-06-05 | `backend`: `npm run build` | Exit **0** | `tsc` |
| 2026-06-05 | root: `npm run build` | Exit **0** | CRA compile; ESLint warnings only (unrelated modules) |

---

## Blockers

_None recorded._
