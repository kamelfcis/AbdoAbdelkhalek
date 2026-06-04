import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyThemeVariables, themeIds } from '../design-system/themes';
import { resolveDomainFromPath } from '../shared/hooks/useDomain';

/**
 * Applies fitness/squash theme CSS variables from the current route (or env/hostname).
 */
export function RouteThemeBridge() {
  const { pathname } = useLocation();

  useEffect(() => {
    const domain = resolveDomainFromPath(pathname);
    const themeId = domain === themeIds.SQUASH ? themeIds.SQUASH : themeIds.FITNESS;
    const saved = typeof window !== 'undefined' ? localStorage.getItem('themeMode') : null;
    const mode = saved === 'dark' || saved === 'light' ? saved : 'light';
    applyThemeVariables(themeId, mode);
    document.documentElement.setAttribute('data-squash-ui', themeId === themeIds.SQUASH ? 'true' : 'false');
    if (pathname.startsWith('/squash')) {
      document.documentElement.setAttribute('data-theme', themeIds.SQUASH);
    } else if (pathname.startsWith('/fitness')) {
      document.documentElement.setAttribute('data-theme', themeIds.FITNESS);
    }
  }, [pathname]);

  return null;
}

export default RouteThemeBridge;
