import { describe, expect, it } from 'vitest';
import {
  deriveCardThumbStoragePath,
  deriveThumbStoragePath,
  isImageUpload,
  thumbKeyForUpload,
} from '../../src/infrastructure/media/image-thumbnails.js';

describe('deriveThumbStoragePath', () => {
  it('derives fitness category thumb path', () => {
    expect(deriveThumbStoragePath('categories/foo.jpg')).toBe('categories/thumbs/foo.webp');
  });

  it('derives squash category thumb path', () => {
    expect(deriveThumbStoragePath('squash/categories/bar.png')).toBe(
      'squash/categories/thumbs/bar.webp'
    );
  });

  it('rejects path traversal', () => {
    expect(deriveThumbStoragePath('../evil.jpg')).toBeNull();
  });
});

describe('deriveCardThumbStoragePath', () => {
  it('derives 480w card variant path', () => {
    expect(deriveCardThumbStoragePath('categories/foo.jpg')).toBe(
      'categories/thumbs/foo-480.webp'
    );
  });
});

describe('isImageUpload', () => {
  it('detects image mime types', () => {
    expect(isImageUpload('image/jpeg')).toBe(true);
    expect(isImageUpload('application/pdf')).toBe(false);
  });
});

describe('thumbKeyForUpload', () => {
  it('prefixes bucket when thumb path is relative', () => {
    expect(thumbKeyForUpload('categories', 'categories/x.jpg', 'categories/thumbs/x.webp')).toBe(
      'categories/thumbs/x.webp'
    );
  });

  it('keeps squash keys intact', () => {
    expect(
      thumbKeyForUpload('squash/categories', 'squash/categories/x.jpg', 'squash/categories/thumbs/x.webp')
    ).toBe('squash/categories/thumbs/x.webp');
  });
});
