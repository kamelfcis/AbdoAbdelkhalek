import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../src/domains/shared/auth/user.repository.js', () => ({
  findUserById: vi.fn(),
}));

import { findUserById } from '../../src/domains/shared/auth/user.repository.js';
import * as repo from '../../src/domains/squash/squash.repository.js';
import { listVideos, listCategories } from '../../src/domains/squash/squash.service.js';

describe('squash trainee content access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns accessible videos for authenticated trainees', async () => {
    vi.spyOn(repo, 'listSquashAccessibleVideos').mockResolvedValue([{ id: 'v1' }] as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: false } as never);

    const result = await listVideos({ sub: 'trainee-1', isCoach: false });

    expect(repo.listSquashAccessibleVideos).toHaveBeenCalledWith('trainee-1');
    expect(result).toEqual([{ id: 'v1' }]);
  });

  it('returns accessible categories for authenticated trainees', async () => {
    vi.spyOn(repo, 'listSquashAccessibleCategories').mockResolvedValue([{ id: 'c1' }] as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: false } as never);

    const result = await listCategories({ sub: 'trainee-1', isCoach: false });

    expect(repo.listSquashAccessibleCategories).toHaveBeenCalledWith('trainee-1');
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('returns all videos for coaches', async () => {
    vi.spyOn(repo, 'listSquashVideosAll').mockResolvedValue([{ id: 'v-all' }] as never);
    vi.mocked(findUserById).mockResolvedValue({ isCoach: true } as never);

    const result = await listVideos({ sub: 'coach-1', isCoach: true });

    expect(repo.listSquashVideosAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'v-all' }]);
  });
});
