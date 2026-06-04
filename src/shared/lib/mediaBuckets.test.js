import { getMediaBuckets, resolveDomainMediaUrl } from './mediaBuckets';

describe('getMediaBuckets', () => {
  it('returns squash prefixes for squash domain', () => {
    const b = getMediaBuckets('squash');
    expect(b.videos).toBe('squash/videos');
    expect(b.categories).toBe('squash/categories');
  });

  it('returns fitness buckets for fitness domain', () => {
    const b = getMediaBuckets('fitness');
    expect(b.videos).toBe('videos');
  });
});

describe('resolveDomainMediaUrl', () => {
  it('uses legacy fitness path on squash when needed', () => {
    const url = resolveDomainMediaUrl(null, 'categories/old-id.jpg', 'squash', 'categories');
    expect(url).toContain('categories/old-id.jpg');
  });

  it('resolves legacy before/after success story paths on squash', () => {
    const url = resolveDomainMediaUrl(null, 'before/story-id.jpg', 'squash', 'successStories');
    expect(url).toContain('success-stories/before/story-id.jpg');
  });
});
