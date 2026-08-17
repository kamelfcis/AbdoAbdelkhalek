import type { FavoriteDomain } from './favorites.repository.js';
import * as repo from './favorites.repository.js';

export async function listFavorites(userId: string, domain: FavoriteDomain) {
  const videoIds = await repo.listFavoriteVideoIds(userId, domain);
  return { videoIds, domain };
}

export async function toggleFavorite(
  userId: string,
  domain: FavoriteDomain,
  videoId: string
) {
  const result = await repo.toggleFavorite(userId, domain, videoId);
  return { ...result, domain };
}

export async function syncFavorites(
  userId: string,
  domain: FavoriteDomain,
  videoIds: string[]
) {
  const ids = await repo.syncFavorites(userId, domain, videoIds);
  return { videoIds: ids, domain };
}
