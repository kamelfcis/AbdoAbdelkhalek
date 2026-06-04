import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useVideos = (options) =>
  useContentEntity('videos', { scope: 'public', ...options });
