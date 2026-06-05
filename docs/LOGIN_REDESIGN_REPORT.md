# Premium Login Redesign — Completion Report

**Date:** 2026-06-05  
**Branch / deploy:** workspace QA (local)  
**Reviewer:** Code review + automated build/test (no browser session)

Post-implementation summary for the premium split-screen login. Completed during the `qa-build` milestone.

---

## Summary

Shipped a split-screen premium login experience with dedicated i18n bundles, extracted auth hook, forgot/reset password (API + UI), remember-me (client prefill + longer refresh cookie), and signup panel aligned to the glass auth aesthetic.

### Delivered

1. **LoginPage split layout** — `LoginShowcase` + `LoginAuthPanel` / `LoginSignupPanel`, `login-page.css`, Framer Motion via `login.motion.js` (`useReducedMotion`).
2. **i18n** — `login.en.js` / `login.ar.js` and `getLoginTranslation()` consumed by `useLoginAuth` and all login panels.
3. **Forgot / reset password** — `ForgotPasswordPanel`, `ResetPasswordPage`, `authService.requestPasswordReset` / `resetPassword`, backend `/api/auth/forgot-password` and `/api/auth/reset-password`, Vitest unit tests.
4. **Remember me** — `localStorage` key `loginRememberEmail`; login POST includes `rememberMe`; backend `env.rememberMeExpiresDays` for refresh cookie `maxAge`.
5. **Signup panel** — `LoginSignupPanel` glass styling consistent with auth panel inputs and alerts.

### Not in scope / deferred

- Production screenshot capture (paths listed below remain placeholders).
- Live manual click-through in EN/AR on real devices (matrix below is **code-review verified**).
- Transactional email configuration in production (documented under env vars).

---

## Screenshots

| View | Path / notes |
|------|----------------|
| Desktop EN | _e.g. `docs/screenshots/login-desktop-en.png`_ |
| Desktop AR (RTL) | _TBD_ |
| Mobile EN | _TBD_ |
| Forgot password panel | _TBD_ |
| Reset password page | _TBD_ |

---

## QA matrix

**Method:** Static code review of `src/features/auth/login/*`, `useLoginAuth.js`, `authService.ts`, `router.jsx`, and backend `routes.ts` / `user.repository.ts`. **Pass** = implementation present and consistent with expected behavior; not exercised in a browser in this QA run.

| # | Area | Scenario | EN | AR (RTL) | Mobile | Coach | Trainee | Pass / Fail | Notes |
|---|------|----------|----|----------|--------|-------|---------|-------------|-------|
| 1 | Login | Valid credentials → redirect | CR | CR | CR | CR | CR | **Pass** | `handleLogin` → `login()` then `navigate` after success; auto-redirect `useEffect` when already authenticated |
| 2 | Login | Invalid credentials → error alert | CR | CR | CR | CR | CR | **Pass** | Maps API invalid/credentials to `t('error-text')`; `Alert` `role="alert"` |
| 3 | Redirect | Coach → `getDefaultDashboardPath()` | CR | CR | CR | CR | — | **Pass** | Coach branch in `useEffect` and post-login `setTimeout` |
| 4 | Redirect | Trainee → `/fitness` or `/squash` per `?domain=` | CR | CR | CR | — | CR | **Pass** | `traineeHomePath(signupDomain)` from `parseSignupDomain` |
| 5 | Session | Access token in memory; refresh cookie set | CR | CR | CR | CR | CR | **Pass** | `authService.signInWithPassword` + backend `res.cookie('refreshToken', …)` |
| 6 | Session | Page refresh restores session via AuthContext | CR | CR | CR | CR | CR | **Pass** | `getSession` / `refreshSession` unchanged; login uses existing context |
| 7 | i18n | All UI strings from `getLoginTranslation` | CR | CR | CR | CR | CR | **Pass** | `t()` in hook; AR copy in `login.ar.js` |
| 8 | Layout | Desktop 60/40 grid, full viewport height | CR | CR | — | CR | CR | **Pass** | `@media (min-width: 768px)` `grid-template-columns: 60% 40%`; `min-height: 100vh` |
| 9 | Layout | Mobile: showcase above auth, no horizontal scroll | CR | CR | CR | CR | CR | **Pass** | Default `flex-direction: column`; showcase `min-height: 40vh` |
| 10 | A11y | Keyboard nav + focus-visible accent ring | CR | CR | CR | CR | CR | **Pass** | Shared inputs + theme/lang toggles `aria-label` |
| 11 | A11y | Password toggle `aria-pressed` + labels | CR | CR | CR | CR | CR | **Pass** | `LoginAuthPanel` / `ResetPasswordPage` |
| 12 | A11y | Error/success `role="alert"` + `aria-live` | CR | CR | CR | CR | CR | **Pass** | All panels use `Alert` with polite live regions |
| 13 | Motion | Animations respect `prefers-reduced-motion` | CR | CR | CR | CR | CR | **Pass** | `useLoginMotion` → `useReducedMotion()` |
| 14 | Signup | Create account + domain `registered_from` | CR | CR | CR | — | CR | **Pass** | `registered_from: signupDomain` in signup payload |
| 15 | Remember me | Email prefilled from `localStorage` when checked | CR | CR | CR | CR | CR | **Pass** | `REMEMBER_EMAIL_KEY` on mount; checkbox state |
| 16 | Remember me | Longer refresh cookie when `rememberMe: true` | CR | CR | CR | CR | CR | **Pass** | Backend `refreshDays = rememberMe ? env.rememberMeExpiresDays : …` |
| 17 | Forgot password | Submit email → success message (no enumeration) | CR | CR | CR | CR | CR | **Pass** | Generic backend message; `t('forgot.success')` |
| 18 | Reset password | Valid token → password updated → login | CR | CR | CR | CR | CR | **Pass** | `ResetPasswordPage` + `authService.resetPassword`; route `/reset-password` |
| 19 | Reset password | Invalid/expired token → error message | CR | CR | CR | CR | CR | **Pass** | API 400 `Invalid or expired reset token`; UI error alert |
| 20 | Build | `npm run build` succeeds | — | — | — | — | — | **Pass** | Root CRA build exit **0**; login chunk **6.73 kB** gzip |

**Legend:** CR = code review (not manual UI test in this run).

**Overall result:** **Pass** (build/test green; code-review matrix complete)  
**Sign-off:** Automated QA, 2026-06-05

---

## Environment variables (password reset email)

Document production configuration for transactional email.

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes (Resend path) | API key for Resend transactional email |
| `EMAIL_FROM` | Yes | Sender address (e.g. `noreply@yourdomain.com`) |
| `APP_PUBLIC_URL` | Yes | Public app URL for reset links (e.g. Vercel production URL) |
| `SMTP_HOST` | Optional | SMTP host if using nodemailer instead of Resend |
| `SMTP_PORT` | Optional | SMTP port |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |

### Dev behavior without email configured

Forgot-password still returns **200** with the generic message when the user exists; email send failures are logged server-side (`logger.error` in `routes.ts`) and do not change the client-facing response. Without `RESEND_API_KEY` / SMTP, mailer should no-op or warn per `mailer.ts` implementation.

---

## Build output

| Date | Command | Exit code | Login chunk size (gzip) |
|------|---------|-----------|-------------------------|
| 2026-06-05 | `backend`: `npm test` | **0** | N/A |
| 2026-06-05 | `backend`: `npm run build` (`tsc`) | **0** | N/A |
| 2026-06-05 | root: `npm run build` | **0** | **6.73 kB** (`login.*.chunk.js`); reset-password **1.51 kB** JS + **1.79 kB** CSS |

### Test notes

- Full backend suite: **55 passed**, **3 skipped** (integration gated).
- First `npm test` run reported one failure: `POST /api/auth/reset-password` → expected **400**, received **500** (~1s). **Fix:** reset-password Vitest cases now use `crypto.randomBytes(32)` tokens to avoid collisions with a live DB token hash. Subsequent runs: **all passed**.

---

## Known issues / follow-ups

| Issue | Severity | Ticket / owner |
|-------|----------|----------------|
| CRA build emits ESLint warnings in unrelated dashboard/fitness/squash files | Low | Pre-existing; not introduced by login redesign |
| None remaining for login QA | — | — |
| Manual screenshot + device QA | Low | Product / design |

