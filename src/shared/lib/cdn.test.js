import {
  deriveThumbStoragePath,
  getMediaBase,
  isCloudflareImageResizingEnabled,
  mediaThumbUrl,
  resolveMediaUrl,
  toMediaUrl,
} from './cdn';

describe('deriveThumbStoragePath', () => {
  it('derives thumb path from storage path', () => {
    expect(deriveThumbStoragePath('categories/abc.jpg')).toBe('categories/thumbs/abc.webp');
  });

  it('handles squash paths', () => {
    expect(deriveThumbStoragePath('squash/categories/id.png')).toBe(
      'squash/categories/thumbs/id.webp'
    );
  });
});

describe('mediaThumbUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub.example.r2.dev';
    process.env.REACT_APP_USE_CDN = 'false';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'false';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('prefers convention thumb path over full image', () => {
    const url = mediaThumbUrl(null, 'categories/foo.jpg', 'categories', { width: 80 });
    expect(url).toBe('https://pub.example.r2.dev/categories/thumbs/foo.webp');
  });

  it('uses explicit thumbPath when provided', () => {
    const url = mediaThumbUrl(null, 'categories/foo.jpg', 'categories', {
      width: 80,
      thumbPath: 'categories/thumbs/custom.webp',
    });
    expect(url).toBe('https://pub.example.r2.dev/categories/thumbs/custom.webp');
  });

  it('returns absolute URL unchanged when no thumb path applies', () => {
    const url = mediaThumbUrl('http://example.com/foo.jpg', null, 'categories', { width: 80 });
    expect(url).toBe('http://example.com/foo.jpg');
  });

  it('uses CDN host for full image when CDN is enabled', () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'false';
    const url = mediaThumbUrl(null, 'categories/foo.jpg', 'categories', {
      width: 480,
      skipDerivedThumb: true,
    });
    expect(url).toBe('https://cdn.abdelrhmanabdelkhalek.com/categories/foo.jpg');
  });
});

describe('isCloudflareImageResizingEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REACT_APP_CDN_URL = 'https://cdn.example.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns true when CDN is on and custom domain is the media base', () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub.example.r2.dev';
    expect(isCloudflareImageResizingEnabled()).toBe(true);
  });

  it('returns true when CDN uses proxied custom domain without r2 override', () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    delete process.env.REACT_APP_R2_PUBLIC_URL;
    expect(isCloudflareImageResizingEnabled()).toBe(true);
  });

  it('returns false when explicitly opted out', () => {
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'false';
    delete process.env.REACT_APP_R2_PUBLIC_URL;
    expect(isCloudflareImageResizingEnabled()).toBe(false);
  });

  it('returns false by default (opt-in) even on a proxied custom domain', () => {
    process.env.REACT_APP_USE_CDN = 'true';
    delete process.env.REACT_APP_CF_IMAGE_RESIZING;
    delete process.env.REACT_APP_R2_PUBLIC_URL;
    expect(isCloudflareImageResizingEnabled()).toBe(false);
  });

  it('returns false when opted in but CDN is disabled', () => {
    process.env.REACT_APP_USE_CDN = 'false';
    process.env.REACT_APP_CF_IMAGE_RESIZING = 'true';
    expect(isCloudflareImageResizingEnabled()).toBe(false);
  });
});

describe('resolveMediaUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub.example.r2.dev';
    process.env.REACT_APP_USE_CDN = 'false';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('prefers absolute image_path over legacy filename in image_url', () => {
    const url = resolveMediaUrl(
      'strength.jpg',
      'https://cdn.example.com/categories/categories/uuid.jpg',
      'categories'
    );
    expect(url).toBe('https://cdn.example.com/categories/categories/uuid.jpg');
  });

  it('prefers relative image_path over legacy filename in image_url', () => {
    const url = resolveMediaUrl('strength.jpg', 'categories/categories/uuid.jpg', 'categories');
    expect(url).toBe('https://pub.example.r2.dev/categories/categories/uuid.jpg');
  });
});

describe('toMediaUrl r2.dev rewrite', () => {
  const originalEnv = process.env;
  const CDN_HOST = 'https://cdn.abdelrhmanabdelkhalek.com';

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REACT_APP_USE_CDN = 'true';
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub-abc123.r2.dev';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rewrites pub-*.r2.dev URLs to CDN host', () => {
    expect(toMediaUrl('https://pub-abc123.r2.dev/videos/foo.mp4')).toBe(
      `${CDN_HOST}/videos/foo.mp4`
    );
  });

  it('rewrites configured r2 public URL prefix to CDN host', () => {
    expect(toMediaUrl('https://pub-abc123.r2.dev/categories/bar.jpg')).toBe(
      `${CDN_HOST}/categories/bar.jpg`
    );
  });

  it('prefers CDN host over r2 when CDN is enabled', () => {
    expect(getMediaBase()).toBe(CDN_HOST);
  });
});
