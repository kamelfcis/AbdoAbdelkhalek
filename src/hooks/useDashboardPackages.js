import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardPackages = (options = {}) =>
  useContentEntity('packages', { scope: 'dashboard', ...options });
