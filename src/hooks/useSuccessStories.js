import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useSuccessStories = (options) =>
  useContentEntity('successStories', { scope: 'public', ...options });
