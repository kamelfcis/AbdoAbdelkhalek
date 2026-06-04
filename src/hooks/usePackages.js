import { useContentEntity } from '../shared/hooks/useContentEntity';

export const usePackages = (options) =>
  useContentEntity('packages', { scope: 'public', ...options });
