import { getMediaBuckets, getSharedContentMediaBuckets, resolveDomainMediaUrl } from './mediaBuckets';

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

describe('getSharedContentMediaBuckets', () => {
  it('uses fitness buckets for squash categories and videos', () => {
    expect(getSharedContentMediaBuckets('squash', 'categories').categories).toBe('categories');
    expect(getSharedContentMediaBuckets('squash', 'videos').videos).toBe('videos');
    expect(getSharedContentMediaBuckets('squash', 'videoThumbnails').videoThumbnails).toBe(
      'video-thumbnails'
    );
  });

  it('keeps squash buckets for non-shared entities', () => {
    expect(getSharedContentMediaBuckets('squash', 'reviews').reviews).toBe('squash/reviews');
  });

  it('returns fitness buckets unchanged for fitness domain', () => {
    expect(getSharedContentMediaBuckets('fitness', 'videos').videos).toBe('videos');
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

  it('prefers full image_path URL over legacy image_url filename', () => {
    const url = resolveDomainMediaUrl(
      'strength.jpg',
      'https://cdn.example.com/categories/categories/uuid.jpg',
      'fitness',
      'categories'
    );
    expect(url).toBe('https://cdn.example.com/categories/categories/uuid.jpg');
  });
});
