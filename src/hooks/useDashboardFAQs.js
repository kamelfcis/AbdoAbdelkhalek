import { useContentEntity } from '../shared/hooks/useContentEntity';

export const useDashboardFAQs = (options = {}) =>
  useContentEntity('faqs', { scope: 'dashboard', ...options });
