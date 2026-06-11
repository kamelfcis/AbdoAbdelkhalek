import { isYouTubeUrl } from './resolveVideoPlayUrl';

const warmed = new Set();
const timers = new Map();

const DEBOUNCE_MS = 250;

function warmup(url) {
  if (!url || isYouTubeUrl(url) || warmed.has(url)) return;
  warmed.add(url);

  fetch(url, {
    method: 'GET',
    headers: { Range: 'bytes=0-65535' },
    mode: 'cors',
    cache: 'force-cache',
  }).catch(() => {
    fetch(url, { method: 'HEAD', mode: 'cors', cache: 'force-cache' }).catch(() => {});
  });
}

/**
 * Debounced CDN warmup on card hover/focus — skips YouTube URLs.
 * @param {string} url
 */
export function prefetchVideoUrl(url) {
  if (!url || isYouTubeUrl(url)) return;

  const existing = timers.get(url);
  if (existing) clearTimeout(existing);

  timers.set(
    url,
    setTimeout(() => {
      timers.delete(url);
      warmup(url);
    }, DEBOUNCE_MS)
  );
}

/** @internal test helper */
export function _resetPrefetchState() {
  warmed.clear();
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
}
