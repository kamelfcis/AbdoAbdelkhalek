import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('getVideoThumbSrc', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub.example.r2.dev';
    process.env.REACT_APP_CDN_URL = 'https://cdn.example.com';
    process.env.REACT_APP_USE_CDN = 'false';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'false';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  async function loadGetVideoThumbSrc() {
    const mod = await import('./entityImageUtils');
    return mod.getVideoThumbSrc;
  }

  it('returns null when video has no thumbnail fields', async () => {
    const getVideoThumbSrc = await loadGetVideoThumbSrc();
    expect(getVideoThumbSrc({}, 'fitness')).toEqual({ src: null, fallbackSrc: null });
  });

  it('returns null when thumbnail is pending', async () => {
    const getVideoThumbSrc = await loadGetVideoThumbSrc();
    expect(
      getVideoThumbSrc({ thumbnail_url: 'pending', thumbnail_path: 'video-thumbnails/x.jpg' }, 'fitness')
    ).toEqual({ src: null, fallbackSrc: null });
  });

  it('resolves storage path to full URL when CDN resizing is off', async () => {
    const getVideoThumbSrc = await loadGetVideoThumbSrc();
    const { src, fallbackSrc } = getVideoThumbSrc(
      { thumbnail_path: 'video-thumbnails/abc.jpg' },
      'fitness',
      'table'
    );
    expect(src).toBe('https://pub.example.r2.dev/video-thumbnails/abc.jpg');
    expect(fallbackSrc).toBe('https://pub.example.r2.dev/video-thumbnails/abc.jpg');
  });

  it('returns Cloudflare resized URL for card variant on proxied CDN host', async () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    delete process.env.REACT_APP_R2_PUBLIC_URL;
    const getVideoThumbSrc = await loadGetVideoThumbSrc();

    const { src } = getVideoThumbSrc(
      { thumbnail_url: 'https://cdn.example.com/video-thumbnails/hero.jpg' },
      'fitness',
      'card'
    );

    expect(src).toContain('/cdn-cgi/image/');
    expect(src).toContain('width=480');
    expect(src).toContain('format=webp');
    expect(src).toContain('video-thumbnails/hero.jpg');
  });

  it('rewrites storage path to CDN host when CDN is on (even if R2 URL is configured)', async () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    const getVideoThumbSrc = await loadGetVideoThumbSrc();

    const { src, fallbackSrc } = getVideoThumbSrc(
      { thumbnail_path: 'video-thumbnails/hero.jpg' },
      'fitness',
      'card'
    );

    expect(src).toContain('/cdn-cgi/image/');
    expect(src).toContain('https://cdn.example.com/');
    expect(fallbackSrc).toBe('https://cdn.example.com/video-thumbnails/hero.jpg');
  });

  it('uses smaller fetch width for table variant on proxied CDN host', async () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    delete process.env.REACT_APP_R2_PUBLIC_URL;
    const getVideoThumbSrc = await loadGetVideoThumbSrc();

    const { src } = getVideoThumbSrc(
      { thumbnail_url: 'https://cdn.example.com/video-thumbnails/hero.jpg' },
      'fitness',
      'table'
    );

    expect(src).toContain('width=80');
  });
});
