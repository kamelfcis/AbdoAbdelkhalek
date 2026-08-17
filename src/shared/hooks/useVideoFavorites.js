import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch, getAccessToken } from '../api/apiClient';
import {
  readFavoriteIds,
  writeFavoriteIds,
} from '../lib/favoritesStorage';

export { favoritesStorageKey, readFavoriteIds, writeFavoriteIds } from '../lib/favoritesStorage';

function unionIds(...lists) {
  return Array.from(new Set(lists.flat().map(String)));
}

/**
 * Favorites stay in localStorage so landing/dashboard keep working offline.
 * When a session exists, list/toggle also sync to `user_video_favorites`.
 */
export function useVideoFavorites(domain = 'fitness', enabled = true) {
  const [favoriteVideoIds, setFavoriteVideoIds] = useState(() =>
    typeof window === 'undefined' ? [] : readFavoriteIds(domain)
  );
  const idsRef = useRef(favoriteVideoIds);
  const syncedRef = useRef(false);

  useEffect(() => {
    idsRef.current = favoriteVideoIds;
  }, [favoriteVideoIds]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        writeFavoriteIds(domain, idsRef.current);
      } catch {
        /* ignore quota / private mode */
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [favoriteVideoIds, domain]);

  useEffect(() => {
    if (!enabled || syncedRef.current || !getAccessToken()) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch(`/favorites?domain=${encodeURIComponent(domain)}`);
        if (cancelled) return;
        const serverIds = (data?.videoIds || []).map(String);
        const localIds = idsRef.current;
        const merged = unionIds(localIds, serverIds);
        setFavoriteVideoIds(merged);
        const localOnly = localIds.filter((id) => !serverIds.includes(id));
        if (localOnly.length) {
          await apiFetch('/favorites/sync', {
            method: 'POST',
            body: JSON.stringify({ domain, videoIds: merged }),
          });
        }
        syncedRef.current = true;
      } catch {
        /* keep localStorage until the table exists / session works */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [domain, enabled]);

  const toggleFavorite = useCallback(
    (videoId) => {
      const videoIdStr = String(videoId);
      setFavoriteVideoIds((prev) =>
        prev.includes(videoIdStr) ? prev.filter((id) => id !== videoIdStr) : [...prev, videoIdStr]
      );
      if (!getAccessToken()) return;
      apiFetch('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ domain, videoId: videoIdStr }),
      }).catch(() => {
        /* localStorage already updated */
      });
    },
    [domain]
  );

  const isFavorite = useCallback(
    (videoId) => favoriteVideoIds.includes(String(videoId)),
    [favoriteVideoIds]
  );

  return { favoriteVideoIds, toggleFavorite, isFavorite, setFavoriteVideoIds };
}
