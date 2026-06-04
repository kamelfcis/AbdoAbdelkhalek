import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useFAQs = (options) =>
  useContentEntity('faqs', { scope: 'public', ...options });
