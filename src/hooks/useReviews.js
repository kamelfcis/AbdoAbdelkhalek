import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useReviews = (options) =>
  useContentEntity('reviews', { scope: 'public', ...options });
