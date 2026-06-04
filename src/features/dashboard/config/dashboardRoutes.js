import { entityRegistry } from './entityRegistry';

export const VALID_DOMAINS = ['fitness', 'squash'];
export const DEFAULT_SECTION = 'overview';

function sectionsForDomain(domain) {
  const registry = entityRegistry[domain] || entityRegistry.fitness;
  const keys = registry.navItems.map((item) => item.key);
  if (!keys.includes(DEFAULT_SECTION)) {
    return [DEFAULT_SECTION, ...keys];
  }
  return keys;
}

export const SECTIONS_BY_DOMAIN = {
  fitness: sectionsForDomain('fitness'),
  squash: sectionsForDomain('squash'),
};

export function parseDomain(param) {
  return VALID_DOMAINS.includes(param) ? param : 'fitness';
}

export function isValidSection(domain, section) {
  const d = parseDomain(domain);
  return SECTIONS_BY_DOMAIN[d]?.includes(section) ?? false;
}

export function isValidDashboardRoute(domain, section) {
  return isValidSection(domain, section);
}

export function buildDashboardPath(domain, section = DEFAULT_SECTION) {
  const d = parseDomain(domain);
  const s = isValidSection(d, section) ? section : DEFAULT_SECTION;
  return `/dashboard/${d}/${s}`;
}

export function getDefaultDashboardDomain() {
  const env = (process.env.REACT_APP_DOMAIN || '').trim().toLowerCase();
  return env === 'squash' ? 'squash' : 'fitness';
}

export function getDefaultDashboardPath() {
  return buildDashboardPath(getDefaultDashboardDomain(), DEFAULT_SECTION);
}

/** Legacy ?domain=&section= query → path */
export function pathFromLegacySearchParams(searchParams) {
  const domain = searchParams.get('domain');
  const section = searchParams.get('section');
  if (!domain && !section) return null;
  const d = parseDomain(domain || getDefaultDashboardDomain());
  const s = section && isValidSection(d, section) ? section : DEFAULT_SECTION;
  return buildDashboardPath(d, s);
}

export function resolveSectionForDomainChange(targetDomain, currentSection) {
  const d = parseDomain(targetDomain);
  if (isValidSection(d, currentSection)) return currentSection;
  return DEFAULT_SECTION;
}
