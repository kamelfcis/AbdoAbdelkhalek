import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  resolveVideoPlayUrl,
  isYouTubeUrl,
  toYouTubeEmbed,
} from './resolveVideoPlayUrl';

describe('isYouTubeUrl', () => {
  it('detects youtube.com and youtu.be URLs', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=abc123')).toBe(true);
    expect(isYouTubeUrl('https://youtu.be/abc123')).toBe(true);
    expect(isYouTubeUrl('https://cdn.example.com/videos/foo.mp4')).toBe(false);
  });
});

describe('toYouTubeEmbed', () => {
  it('converts watch URLs to embed with autoplay', () => {
    expect(toYouTubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1'
    );
  });

  it('converts youtu.be short links', () => {
    expect(toYouTubeEmbed('https://youtu.be/abc-123')).toBe(
      'https://www.youtube.com/embed/abc-123?autoplay=1&rel=0&modestbranding=1'
    );
  });
});

describe('resolveVideoPlayUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.REACT_APP_R2_PUBLIC_URL = 'https://pub.example.r2.dev';
    process.env.REACT_APP_USE_CDN = 'false';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns YouTube embed for youtube video_url', () => {
    const url = resolveVideoPlayUrl({
      video_url: 'https://www.youtube.com/watch?v=testid',
    });
    expect(url).toContain('youtube.com/embed/testid');
  });

  it('rewrites absolute MP4 video_url via media base', () => {
    const url = resolveVideoPlayUrl({
      video_url: 'https://pub.example.r2.dev/videos/clip.mp4',
    });
    expect(url).toBe('https://pub.example.r2.dev/videos/clip.mp4');
  });

  it('resolves fitness video_path to CDN URL', () => {
    const url = resolveVideoPlayUrl({ video_path: 'workout.mp4' }, 'fitness');
    expect(url).toBe('https://pub.example.r2.dev/videos/workout.mp4');
  });

  it('resolves squash video_path under squash/videos bucket', () => {
    const url = resolveVideoPlayUrl(
      { video_path: 'squash/videos/lesson.mp4' },
      'squash'
    );
    expect(url).toBe('https://pub.example.r2.dev/squash/videos/lesson.mp4');
  });

  it('returns empty string when no URL fields', () => {
    expect(resolveVideoPlayUrl({})).toBe('');
  });
});
