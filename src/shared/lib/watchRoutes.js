/** Shareable watch URLs — only fitness/squash + UUID, never open redirects. */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WATCH_NEXT_RE =
  /^\/(fitness|squash)\/watch\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWatchVideoId(id) {
  return typeof id === 'string' && UUID_RE.test(id);
}

export function buildWatchPath(domain, id) {
  const d = domain === 'squash' ? 'squash' : 'fitness';
  return `/${d}/watch/${id}`;
}

/**
 * Allow only `/fitness/watch/<uuid>` or `/squash/watch/<uuid>`.
 * Rejects protocol-relative URLs, query/hash, traversal, and foreign hosts.
 */
export function isSafeWatchNext(path) {
  if (typeof path !== 'string') return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (path.includes('\\') || path.includes('?') || path.includes('#') || path.includes('..')) {
    return false;
  }
  return WATCH_NEXT_RE.test(path);
}

export function buildWatchUrl(domain, id, origin) {
  const path = buildWatchPath(domain, id);
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${path}`;
}

/**
 * Compact navigation state so the watch page can paint the poster/title
 * before GET /videos/:id returns. Never include play URLs.
 */
export function buildWatchLocationState(video) {
  if (!video?.id) return undefined;
  return {
    id: video.id,
    title_en: video.title_en || video.titleEn || video.title || '',
    title_ar: video.title_ar || video.titleAr || video.title || '',
    thumb: video.thumbnail_url || video.thumbnailUrl || video.thumb || '',
    is_public: Boolean(video.is_public ?? video.isPublic),
  };
}

export function readWatchLocationState(state, videoId) {
  if (!state || String(state.id) !== String(videoId)) return null;
  return {
    id: state.id,
    title_en: state.title_en,
    title_ar: state.title_ar,
    thumbnail_url: state.thumb || state.thumbnail_url || '',
    thumb: state.thumb || state.thumbnail_url || '',
    is_public: Boolean(state.is_public),
  };
}
