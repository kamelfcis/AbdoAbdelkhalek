import { z } from 'zod';

export const favoriteDomainSchema = z.enum(['fitness', 'squash']);

export const favoriteToggleSchema = z.object({
  domain: favoriteDomainSchema,
  videoId: z.string().uuid(),
});

export const favoriteSyncSchema = z.object({
  domain: favoriteDomainSchema,
  videoIds: z.array(z.string().uuid()).max(500),
});
