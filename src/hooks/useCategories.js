import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useCategories = (options) =>
  useContentEntity('categories', { scope: 'public', ...options });
