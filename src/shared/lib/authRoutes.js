/** Auth URL helpers — tie signup/login to fitness vs squash landing. */

const VALID_DOMAINS = new Set(['fitness', 'squash']);

export function parseSignupDomain(value) {
  if (typeof value === 'string' && VALID_DOMAINS.has(value)) return value;
  return null;
}

export function loginPath(domain) {
  const parsed = parseSignupDomain(domain);
  return parsed ? `/login?domain=${parsed}` : '/login';
}

export function traineeHomePath(domain) {
  const parsed = parseSignupDomain(domain);
  if (parsed === 'squash') return '/squash';
  if (parsed === 'fitness') return '/fitness';
  return '/';
}
