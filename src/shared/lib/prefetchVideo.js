import { isYouTubeUrl } from './resolveVideoPlayUrl';
import { toMediaUrl } from './cdn';

const warmed = new Set();
const timers = new Map();

const DEBOUNCE_MS = 250;
/** First 256 KB — enough for moov/faststart on most trainee MP4s without heavy hover cost. */
const WARMUP_RANGE_END = 262143;

function warmup(rawUrl) {
  if (!rawUrl || isYouTubeUrl(rawUrl)) return;
  // Always warm the CDN-rewritten URL: stale caches can hand callers raw
  // r2.dev URLs, which lack CORS headers and 404 the warmup fetch.
  const url = toMediaUrl(rawUrl);
  if (!url || warmed.has(url)) return;
  warmed.add(url);

  fetch(url, {
    method: 'GET',
    headers: { Range: `bytes=0-${WARMUP_RANGE_END}` },
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

/**
 * Immediate (non-debounced) warmup — for pointerdown/click, when playback is imminent.
 * @param {string} url
 */
export function warmVideoUrl(url) {
  if (!url || isYouTubeUrl(url)) return;
  const existing = timers.get(url);
  if (existing) {
    clearTimeout(existing);
    timers.delete(url);
  }
  warmup(url);
}

/** @internal test helper */
export function _resetPrefetchState() {
  warmed.clear();
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
}
