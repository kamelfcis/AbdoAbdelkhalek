import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardReviews = (options = {}) =>
  useContentEntity('reviews', { scope: 'dashboard', ...options });
