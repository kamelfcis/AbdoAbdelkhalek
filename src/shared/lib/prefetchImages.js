const warmedUrls = new Set();
const inFlight = new Map();

export function isImagePrefetched(url) {
  return Boolean(url && warmedUrls.has(url));
}

/** @internal test helper */
export function resetPrefetchedImages() {
  warmedUrls.clear();
  inFlight.clear();
}

function loadImage(url) {
  if (warmedUrls.has(url)) return Promise.resolve();
  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = new Promise((resolve) => {
    const img = new Image();
    const finish = () => {
      warmedUrls.add(url);
      resolve();
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = url;
  }).finally(() => {
    inFlight.delete(url);
  });

  inFlight.set(url, promise);
  return promise;
}

/**
 * Warm the browser image cache for dashboard thumbnails in parallel.
 */
export async function prefetchImageUrls(urls, { concurrency = 8 } = {}) {
  const queue = [...new Set(urls.filter(Boolean).filter((url) => !warmedUrls.has(url)))];
  if (!queue.length) return;

  let index = 0;
  const workerCount = Math.min(concurrency, queue.length);

  async function worker() {
    while (index < queue.length) {
      const current = index;
      index += 1;
      await loadImage(queue[current]);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}
