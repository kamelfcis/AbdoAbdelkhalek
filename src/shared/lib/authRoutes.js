/** Auth URL helpers — tie signup/login to fitness vs squash landing. */

import { isSafeWatchNext } from './watchRoutes';

const VALID_DOMAINS = new Set(['fitness', 'squash']);

export function parseSignupDomain(value) {
  if (typeof value === 'string' && VALID_DOMAINS.has(value)) return value;
  return null;
}

export function loginPath(domain, next) {
  const parsed = parseSignupDomain(domain);
  const params = new URLSearchParams();
  if (parsed) params.set('domain', parsed);
  if (isSafeWatchNext(next)) {
    params.set('next', next);
  }
  const qs = params.toString();
  return qs ? `/login?${qs}` : '/login';
}

export function traineeHomePath(domain) {
  const parsed = parseSignupDomain(domain);
  if (parsed === 'squash') return '/squash';
  if (parsed === 'fitness') return '/fitness';
  return '/';
}

/** After login/signup: honor safe watch `next` or router `from`, else domain home / dashboard. */
export function resolvePostLoginPath({
  signupDomain,
  nextParam,
  fromLocation,
  isCoach,
  coachDashboardPath = '/dashboard/fitness/videos',
}) {
  if (isSafeWatchNext(nextParam)) return nextParam;
  const fromPath =
    typeof fromLocation === 'string' ? fromLocation : fromLocation?.pathname;
  if (isSafeWatchNext(fromPath)) return fromPath;
  if (isCoach) return coachDashboardPath;
  return traineeHomePath(signupDomain);
}
