import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardSuccessStories = (options = {}) =>
  useContentEntity('successStories', { scope: 'dashboard', ...options });
