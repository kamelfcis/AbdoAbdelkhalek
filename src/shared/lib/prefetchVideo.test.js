import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prefetchVideoUrl, warmVideoUrl, _resetPrefetchState } from './prefetchVideo';

vi.mock('./resolveVideoPlayUrl', () => ({
  isYouTubeUrl: (url) => /youtu/.test(url || ''),
}));

vi.mock('./cdn', () => ({
  toMediaUrl: (url) => url,
}));

describe('prefetchVideo', () => {
  beforeEach(() => {
    _resetPrefetchState();
    vi.useFakeTimers();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 206 }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    _resetPrefetchState();
  });

  it('debounces hover warmup and warms immediately on pointerdown', () => {
    prefetchVideoUrl('https://cdn.example.com/clip.mp4');
    expect(fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers.Range).toBe('bytes=0-262143');

    warmVideoUrl('https://cdn.example.com/other.mp4');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('skips YouTube URLs', () => {
    warmVideoUrl('https://www.youtube.com/watch?v=abc');
    prefetchVideoUrl('https://youtu.be/abc');
    vi.advanceTimersByTime(500);
    expect(fetch).not.toHaveBeenCalled();
  });
});
