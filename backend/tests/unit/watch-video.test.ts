import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { TokenPayload } from '../../src/domains/shared/auth/jwt.js';

vi.mock('../../src/domains/shared/auth/user.repository.js', () => ({
  findUserById: vi.fn(),
}));

import { findUserById } from '../../src/domains/shared/auth/user.repository.js';
import * as fitnessRepo from '../../src/domains/fitness/fitness.repository.js';
import * as squashRepo from '../../src/domains/squash/squash.repository.js';
import { getVideo } from '../../src/domains/fitness/fitness.service.js';
import { getVideo as getSquashVideo } from '../../src/domains/squash/squash.service.js';

const baseVideo = {
  id: 'vid-1',
  titleEn: 'Private workout',
  titleAr: 'تمرين خاص',
  descriptionEn: 'Secret plan',
  isPublic: false,
  thumbnailUrl: 'https://cdn/thumb.jpg',
  category: { id: 'cat-1', nameEn: 'Strength', nameAr: 'قوة' },
};

const trainee: TokenPayload = { sub: 'trainee-1', email: 't@example.com', isCoach: false };
const coach: TokenPayload = { sub: 'coach-1', email: 'c@example.com', isCoach: true };

describe('fitness getVideo access', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(findUserById).mockReset();
  });

  it('returns not_found for unknown id', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue(null);
    const result = await getVideo('missing');
    expect(result.kind).toBe('not_found');
  });

  it('guest on private video requires auth', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue(baseVideo as never);
    const result = await getVideo('vid-1');
    expect(result.kind).toBe('requires_auth');
  });

  it('guest on public video can play', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue({
      ...baseVideo,
      isPublic: true,
      videoUrl: 'https://x/v.mp4',
    } as never);
    const result = await getVideo('vid-1');
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.body.canPlay).toBe(true);
      expect(result.body.video_url).toBe('https://x/v.mp4');
    }
  });

  it('trainee without grant gets forbidden metadata without play url', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue({
      ...baseVideo,
      videoUrl: 'secret.mp4',
    } as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: false } as never);
    vi.spyOn(fitnessRepo, 'userCanPlayVideo').mockResolvedValue(false);

    const result = await getVideo('vid-1', trainee);

    expect(result.kind).toBe('forbidden');
    if (result.kind === 'forbidden') {
      expect(result.body.canPlay).toBe(false);
      expect(result.body.title_en).toBe('Private workout');
      expect(result.body.thumbnail_url).toBe('https://cdn/thumb.jpg');
      expect(result.body.category).toEqual({ id: 'cat-1', name_en: 'Strength', name_ar: 'قوة' });
      expect(result.body.video_url).toBeUndefined();
      expect(result.body.video_path).toBeUndefined();
      expect(result.body.description_en).toBeUndefined();
    }
  });

  it('trainee with explicit video grant can play', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue({
      ...baseVideo,
      videoUrl: 'https://x/granted.mp4',
    } as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: false } as never);
    const grantSpy = vi.spyOn(fitnessRepo, 'userCanPlayVideo').mockResolvedValue(true);

    const result = await getVideo('vid-1', trainee);

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.body.canPlay).toBe(true);
      expect(result.body.video_url).toBe('https://x/granted.mp4');
    }
    expect(grantSpy).toHaveBeenCalledWith('trainee-1', 'vid-1');
  });

  it('coach always receives full video', async () => {
    vi.spyOn(fitnessRepo, 'getVideoById').mockResolvedValue({
      ...baseVideo,
      videoPath: 'videos/x.mp4',
    } as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: true } as never);
    const grantSpy = vi.spyOn(fitnessRepo, 'userCanPlayVideo').mockResolvedValue(false);

    const result = await getVideo('vid-1', coach);

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.body.canPlay).toBe(true);
      expect(result.body.video_path).toBe('videos/x.mp4');
    }
    expect(grantSpy).not.toHaveBeenCalled();
  });
});

describe('squash getVideo access', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(findUserById).mockReset();
  });

  it('guest on private squash video requires auth', async () => {
    vi.spyOn(squashRepo, 'getSquashVideoById').mockResolvedValue(baseVideo as never);
    const result = await getSquashVideo('vid-1');
    expect(result.kind).toBe('requires_auth');
  });

  it('granted squash trainee can play', async () => {
    vi.spyOn(squashRepo, 'getSquashVideoById').mockResolvedValue({
      ...baseVideo,
      videoUrl: 'https://x/squash.mp4',
    } as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: false } as never);
    vi.spyOn(squashRepo, 'userCanPlaySquashVideo').mockResolvedValue(true);

    const result = await getSquashVideo('vid-1', trainee);

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.body.canPlay).toBe(true);
      expect(result.body.video_url).toBe('https://x/squash.mp4');
    }
  });
});
