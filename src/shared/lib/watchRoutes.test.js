import { describe, it, expect } from 'vitest';
import {
  buildWatchPath,
  buildWatchUrl,
  isSafeWatchNext,
  isWatchVideoId,
  buildWatchLocationState,
  readWatchLocationState,
} from './watchRoutes';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('buildWatchPath', () => {
  it('builds fitness and squash watch paths', () => {
    expect(buildWatchPath('fitness', UUID)).toBe(`/fitness/watch/${UUID}`);
    expect(buildWatchPath('squash', UUID)).toBe(`/squash/watch/${UUID}`);
  });

  it('defaults unknown domains to fitness', () => {
    expect(buildWatchPath('other', UUID)).toBe(`/fitness/watch/${UUID}`);
  });

  it('builds an absolute watch URL from origin', () => {
    expect(buildWatchUrl('fitness', UUID, 'https://www.abdelrhmanabdelkhalek.com')).toBe(
      `https://www.abdelrhmanabdelkhalek.com/fitness/watch/${UUID}`
    );
  });
});

describe('isWatchVideoId', () => {
  it('accepts UUIDs only', () => {
    expect(isWatchVideoId(UUID)).toBe(true);
    expect(isWatchVideoId('not-a-uuid')).toBe(false);
    expect(isWatchVideoId('')).toBe(false);
  });
});

describe('watch location snapshot', () => {
  it('omits play URLs and restores poster fields', () => {
    const state = buildWatchLocationState({
      id: UUID,
      title_en: 'Sprint',
      title_ar: 'سرعة',
      thumbnail_url: 'https://cdn/thumb.jpg',
      video_url: 'https://cdn/secret.mp4',
      is_public: true,
    });
    expect(state).toEqual({
      id: UUID,
      title_en: 'Sprint',
      title_ar: 'سرعة',
      thumb: 'https://cdn/thumb.jpg',
      is_public: true,
    });
    expect(state).not.toHaveProperty('video_url');

    const restored = readWatchLocationState(state, UUID);
    expect(restored.thumbnail_url).toBe('https://cdn/thumb.jpg');
    expect(readWatchLocationState(state, 'other-id')).toBeNull();
  });
});

describe('isSafeWatchNext', () => {
  it('allows domain-scoped watch UUID paths', () => {
    expect(isSafeWatchNext(`/fitness/watch/${UUID}`)).toBe(true);
    expect(isSafeWatchNext(`/squash/watch/${UUID}`)).toBe(true);
  });

  it('blocks open redirects and unsafe shapes', () => {
    expect(isSafeWatchNext('https://evil.com')).toBe(false);
    expect(isSafeWatchNext('//evil.com')).toBe(false);
    expect(isSafeWatchNext(`/fitness/watch/${UUID}?next=https://evil.com`)).toBe(false);
    expect(isSafeWatchNext(`/fitness/watch/${UUID}#evil`)).toBe(false);
    expect(isSafeWatchNext('/fitness/watch/../admin')).toBe(false);
    expect(isSafeWatchNext('/login')).toBe(false);
    expect(isSafeWatchNext(`/fitness/watch/${UUID}/extra`)).toBe(false);
    expect(isSafeWatchNext('/fitness/watch/not-a-uuid')).toBe(false);
    expect(isSafeWatchNext(`/dashboard/fitness/watch/${UUID}`)).toBe(false);
    expect(isSafeWatchNext(null)).toBe(false);
  });
});
