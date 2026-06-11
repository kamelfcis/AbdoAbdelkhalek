const warmedUrls = new Set();
const failedUrls = new Set();
const inFlight = new Map();

export function isImagePrefetched(url) {
  return Boolean(url && warmedUrls.has(url));
}

export function hasImagePrefetchFailed(url) {
  return Boolean(url && failedUrls.has(url));
}

/** @internal test helper */
export function resetPrefetchedImages() {
  warmedUrls.clear();
  failedUrls.clear();
  inFlight.clear();
}

/** Resolves true when the image loaded, false when it errored. */
function loadImage(url) {
  if (warmedUrls.has(url)) return Promise.resolve(true);
  if (failedUrls.has(url)) return Promise.resolve(false);
  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      warmedUrls.add(url);
      resolve(true);
    };
    img.onerror = () => {
      failedUrls.add(url);
      resolve(false);
    };
    img.src = url;
  }).finally(() => {
    inFlight.delete(url);
  });

  inFlight.set(url, promise);
  return promise;
}

/**
 * Warm the browser image cache for dashboard thumbnails in parallel.
 * Only successful loads are marked warmed; failures are tracked separately
 * so they are never reported as prefetched and are not retried in a storm.
 *
 * @returns {Promise<{loaded: string[], failed: string[]}>}
 */
export async function prefetchImageUrls(urls, { concurrency = 8 } = {}) {
  const queue = [...new Set(urls.filter(Boolean).filter((url) => !warmedUrls.has(url)))];
  const loaded = [];
  const failed = [];
  if (!queue.length) return { loaded, failed };

  let index = 0;
  const workerCount = Math.min(concurrency, queue.length);

  async function worker() {
    while (index < queue.length) {
      const current = index;
      index += 1;
      const url = queue[current];
      const ok = await loadImage(url);
      (ok ? loaded : failed).push(url);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { loaded, failed };
}
