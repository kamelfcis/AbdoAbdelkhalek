import { useEffect, useMemo, useState } from 'react';
import { prefetchImageUrls } from '../../../shared/lib/prefetchImages';

/** Max time the grid waits for thumbs before revealing anyway. */
export const THUMB_BATCH_TIMEOUT_MS = 2500;

/**
 * Warms the current page's thumbnail URLs and reports a single "batch ready"
 * flag so the card grid can reveal every card at once (instead of per-card
 * pop-in). Never blocks past `timeoutMs` — slow/failed thumbs fall back to
 * their own per-image loading states.
 *
 * @param {object} params
 * @param {Array} params.videos current page items
 * @param {(video: object) => {src: ?string, fallbackSrc: ?string}} params.resolveThumbPair
 * @param {boolean} [params.enabled]
 * @param {number} [params.timeoutMs]
 */
export function useVideoThumbBatch({
  videos = [],
  resolveThumbPair,
  enabled = true,
  timeoutMs = THUMB_BATCH_TIMEOUT_MS,
}) {
  const urls = useMemo(() => {
    if (!enabled || !videos.length || typeof resolveThumbPair !== 'function') {
      return [];
    }
    const unique = new Set();
    videos.forEach((video) => {
      const pair = resolveThumbPair(video);
      if (pair?.src) unique.add(pair.src);
      if (pair?.fallbackSrc) unique.add(pair.fallbackSrc);
    });
    return [...unique];
  }, [enabled, videos, resolveThumbPair]);

  const batchKey = urls.join('|');
  const [readyKey, setReadyKey] = useState('');

  useEffect(() => {
    if (!enabled || !urls.length) return undefined;

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReadyKey(batchKey);
    };
    const timer = setTimeout(markReady, timeoutMs);

    prefetchImageUrls(urls)
      .catch(() => {})
      .then(markReady)
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // batchKey is derived from urls; urls identity churn with equal content is harmless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, batchKey, timeoutMs]);

  const isThumbBatchReady = !enabled || !urls.length || readyKey === batchKey;

  return { isThumbBatchReady };
}
