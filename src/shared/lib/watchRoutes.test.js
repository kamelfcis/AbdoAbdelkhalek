import { describe, it, expect } from 'vitest';
import { buildWatchPath, buildWatchUrl, isSafeWatchNext, isWatchVideoId } from './watchRoutes';

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
