export function favoritesStorageKey(domain = 'fitness') {
  return domain === 'squash' ? 'traineeFavoriteVideos:squash' : 'traineeFavoriteVideos';
}

export function readFavoriteIds(domain = 'fitness') {
  try {
    const saved = localStorage.getItem(favoritesStorageKey(domain));
    return saved ? JSON.parse(saved).map(String) : [];
  } catch {
    return [];
  }
}

export function writeFavoriteIds(domain, ids) {
  localStorage.setItem(favoritesStorageKey(domain), JSON.stringify((ids || []).map(String)));
}
