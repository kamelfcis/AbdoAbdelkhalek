import { useMemo } from 'react';
import { themeIds } from '../../design-system/themes';

/**
 * Domain from URL path (landing routes). Portal `/` returns null.
 * @param {string} [pathname]
 * @returns {'fitness'|'squash'|null}
 */
export function resolveDomainFromPath(pathname = '') {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  if (path === '/squash' || path.startsWith('/squash/')) return themeIds.SQUASH;
  if (path === '/fitness' || path.startsWith('/fitness/')) return themeIds.FITNESS;
  return null;
}

/**
 * Resolve platform domain from pathname, hostname, or REACT_APP_DOMAIN override.
 * @param {string} [hostname]
 * @param {string} [pathname]
 * @returns {'fitness'|'squash'}
 */
export function resolveDomain(hostname, pathname) {
  const fromPath = resolveDomainFromPath(
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '')
  );
  if (fromPath) return fromPath;
  const override = (process.env.REACT_APP_DOMAIN || '').trim().toLowerCase();
  if (override === 'squash' || override === 'fitness') {
    return override;
  }

  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  if (host.startsWith('squash.') || host.includes('squash.abdelrhmanabdelkhalek')) {
    return themeIds.SQUASH;
  }
  return themeIds.FITNESS;
}

/**
 * Hook — current site domain for theming and future API prefix selection.
 */
export function useDomain() {
  return useMemo(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const domain = resolveDomain(undefined, pathname);
    return {
      domain,
      isFitness: domain === themeIds.FITNESS,
      isSquash: domain === themeIds.SQUASH,
      themeId: domain,
    };
  }, []);
}

export default useDomain;
