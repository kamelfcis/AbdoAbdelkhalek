import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEnv = {
  useCdn: true,
  cdnBaseUrl: 'https://cdn.example.com',
  mediaBaseUrl: 'https://cdn.example.com',
  r2PublicUrl: 'https://pub-abc123.r2.dev',
  supabaseUrl: 'https://example.supabase.co',
};

describe('cdn-url rewrite', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('../../src/config/env.js', () => ({ env: mockEnv }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rewrites pub-*.r2.dev URLs to CDN base when USE_CDN is enabled', async () => {
    const { rewriteStorageUrl } = await import('../../src/common/utils/cdn-url.js');
    const input = 'https://pub-abc123.r2.dev/videos/foo.mp4';
    expect(rewriteStorageUrl(input)).toBe('https://cdn.example.com/videos/foo.mp4');
  });

  it('rewrites r2PublicUrl prefix to CDN base', async () => {
    const { rewriteStorageUrl } = await import('../../src/common/utils/cdn-url.js');
    const input = 'https://pub-abc123.r2.dev/categories/bar.jpg';
    expect(rewriteStorageUrl(input)).toBe('https://cdn.example.com/categories/bar.jpg');
  });

  it('rewrites Supabase storage URLs to CDN base', async () => {
    const { rewriteStorageUrl } = await import('../../src/common/utils/cdn-url.js');
    const input =
      'https://example.supabase.co/storage/v1/object/public/videos/foo.mp4';
    expect(rewriteStorageUrl(input)).toBe('https://cdn.example.com/videos/foo.mp4');
  });

  it('deep-rewrites r2.dev URLs in nested payloads', async () => {
    const { rewriteMediaUrls } = await import('../../src/common/utils/cdn-url.js');
    const input = {
      video_url: 'https://pub-other.r2.dev/videos/a.mp4',
      nested: [{ thumb: 'https://pub-other.r2.dev/thumbs/b.webp' }],
    };
    expect(rewriteMediaUrls(input)).toEqual({
      video_url: 'https://cdn.example.com/videos/a.mp4',
      nested: [{ thumb: 'https://cdn.example.com/thumbs/b.webp' }],
    });
  });

  it('buildMediaUrl uses CDN base when USE_CDN is enabled', async () => {
    const { buildMediaUrl } = await import('../../src/common/utils/cdn-url.js');
    expect(buildMediaUrl('videos', 'foo.mp4')).toBe('https://cdn.example.com/videos/foo.mp4');
  });
});
