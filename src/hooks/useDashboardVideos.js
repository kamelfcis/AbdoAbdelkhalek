import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardVideos = (options = {}) =>
  useContentEntity('videos', { scope: 'dashboard', ...options });
