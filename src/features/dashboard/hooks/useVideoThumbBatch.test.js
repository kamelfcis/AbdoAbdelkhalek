import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as prefetchImages from '../../../shared/lib/prefetchImages';
import { useVideoThumbBatch } from './useVideoThumbBatch';

describe('useVideoThumbBatch', () => {
  let prefetchSpy;

  beforeEach(() => {
    prefetchSpy = vi
      .spyOn(prefetchImages, 'prefetchImageUrls')
      .mockImplementation(() => new Promise(() => {}));
  });

  afterEach(() => {
    prefetchSpy.mockRestore();
  });

  it('starts not ready then becomes ready after prefetch resolves', async () => {
    let resolvePrefetch;
    prefetchSpy.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrefetch = () => resolve({ loaded: [], failed: [] });
        })
    );

    const videos = [{ id: 'v1' }, { id: 'v2' }];
    const resolveThumbPair = vi.fn((video) => ({
      src: `https://cdn.example.com/${video.id}.webp`,
      fallbackSrc: `https://cdn.example.com/${video.id}.jpg`,
    }));

    const { result } = renderHook(() =>
      useVideoThumbBatch({ videos, resolveThumbPair })
    );

    await waitFor(() => {
      expect(prefetchSpy).toHaveBeenCalledWith([
        'https://cdn.example.com/v1.webp',
        'https://cdn.example.com/v1.jpg',
        'https://cdn.example.com/v2.webp',
        'https://cdn.example.com/v2.jpg',
      ]);
    });

    expect(result.current.isThumbBatchReady).toBe(false);

    await act(async () => {
      resolvePrefetch();
    });

    await waitFor(() => {
      expect(result.current.isThumbBatchReady).toBe(true);
    });
  });

  it('is ready immediately when there are no videos', async () => {
    const resolveThumbPair = vi.fn(() => ({ src: null, fallbackSrc: null }));
    const { result } = renderHook(() =>
      useVideoThumbBatch({ videos: [], resolveThumbPair })
    );

    await act(async () => {});

    expect(result.current.isThumbBatchReady).toBe(true);
    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it('is ready immediately when disabled', async () => {
    const videos = [{ id: 'v1' }];
    const resolveThumbPair = vi.fn(() => ({
      src: 'https://cdn.example.com/v1.webp',
      fallbackSrc: null,
    }));

    const { result } = renderHook(() =>
      useVideoThumbBatch({ videos, resolveThumbPair, enabled: false })
    );

    await act(async () => {});

    expect(result.current.isThumbBatchReady).toBe(true);
    expect(prefetchSpy).not.toHaveBeenCalled();
  });
});
