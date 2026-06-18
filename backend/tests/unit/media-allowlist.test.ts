import { describe, it, expect } from 'vitest';
import { isAllowedUploadPath } from '../../src/domains/shared/media/allowlist.js';

describe('media allowlist', () => {
  it('allows fitness buckets', () => {
    expect(isAllowedUploadPath('videos', 'abc.mp4')).toBe(true);
    expect(isAllowedUploadPath('categories', 'id.png')).toBe(true);
  });

  it('allows squash prefixed keys for squash-only entities and legacy content', () => {
    expect(isAllowedUploadPath('videos', 'abc.mp4')).toBe(true);
    expect(isAllowedUploadPath('categories', 'uuid.jpg')).toBe(true);
    expect(isAllowedUploadPath('squash/videos', 'squash/videos/1.mp4')).toBe(true);
    expect(isAllowedUploadPath('squash/categories', 'squash/categories/uuid.jpg')).toBe(true);
    expect(isAllowedUploadPath('squash/video-thumbnails', 'thumb.jpg')).toBe(true);
    expect(
      isAllowedUploadPath('squash/success-stories', 'squash/success-stories/before/id.jpg')
    ).toBe(true);
  });

  it('rejects unknown paths', () => {
    expect(isAllowedUploadPath('other', 'x.png')).toBe(false);
    expect(isAllowedUploadPath('videos', '../secret.mp4')).toBe(false);
  });
});
