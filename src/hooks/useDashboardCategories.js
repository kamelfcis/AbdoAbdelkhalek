import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardCategories = (options = {}) =>
  useContentEntity('categories', { scope: 'dashboard', ...options });
