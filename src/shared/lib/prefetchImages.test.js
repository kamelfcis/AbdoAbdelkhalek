import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isImagePrefetched,
  prefetchImageUrls,
  resetPrefetchedImages,
} from './prefetchImages';

describe('prefetchImageUrls', () => {
  const loadCallbacks = [];

  beforeEach(() => {
    resetPrefetchedImages();
    loadCallbacks.length = 0;

    global.Image = class MockImage {
      constructor() {
        this._src = '';
        loadCallbacks.push(() => this.onload?.());
      }

      set src(value) {
        this._src = value;
        queueMicrotask(() => this.onload?.());
      }

      get src() {
        return this._src;
      }
    };
  });

  afterEach(() => {
    resetPrefetchedImages();
    vi.restoreAllMocks();
  });

  it('dedupes duplicate URLs', async () => {
    const seen = [];
    const OriginalImage = global.Image;
    global.Image = class MockImage {
      set src(value) {
        seen.push(value);
        queueMicrotask(() => this.onload?.());
      }
    };

    await prefetchImageUrls([
      'https://example.com/a.jpg',
      'https://example.com/a.jpg',
      '',
      null,
      'https://example.com/b.jpg',
    ]);

    expect(seen).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    expect(isImagePrefetched('https://example.com/a.jpg')).toBe(true);
    global.Image = OriginalImage;
  });

  it('skips already warmed URLs on revisit', async () => {
    await prefetchImageUrls(['https://example.com/cached.jpg']);

    const seen = [];
    const OriginalImage = global.Image;
    global.Image = class MockImage {
      set src(value) {
        seen.push(value);
        queueMicrotask(() => this.onload?.());
      }
    };

    await prefetchImageUrls(['https://example.com/cached.jpg', 'https://example.com/new.jpg']);

    expect(seen).toEqual(['https://example.com/new.jpg']);
    global.Image = OriginalImage;
  });

  it('respects concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    global.Image = class MockImage {
      set src(value) {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        queueMicrotask(() => {
          inFlight -= 1;
          this.onload?.();
        });
      }
    };

    const urls = Array.from({ length: 12 }, (_, index) => `https://example.com/${index}.jpg`);
    await prefetchImageUrls(urls, { concurrency: 3 });

    expect(maxInFlight).toBeLessThanOrEqual(3);
    urls.forEach((url) => expect(isImagePrefetched(url)).toBe(true));
  });
});
