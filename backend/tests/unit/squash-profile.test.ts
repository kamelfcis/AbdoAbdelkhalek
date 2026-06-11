import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../src/domains/shared/auth/user.repository.js', () => ({
  findUserById: vi.fn(),
}));

import { findUserById } from '../../src/domains/shared/auth/user.repository.js';
import * as repo from '../../src/domains/squash/squash.repository.js';
import { getProfile } from '../../src/domains/squash/squash.service.js';

describe('squash.getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user data, counts, and subscription shape', async () => {
    vi.mocked(findUserById).mockResolvedValue({
      id: 'user-1',
      email: 'trainee@example.com',
      password: null,
      fullName: 'Test Trainee',
      phone: '123',
      isCoach: false,
    });
    vi.spyOn(repo, 'listSquashAccessibleVideos').mockResolvedValue([{ id: 'v1' }, { id: 'v2' }] as never);
    vi.spyOn(repo, 'listSquashAccessibleCategories').mockResolvedValue([{ id: 'c1' }] as never);
    vi.spyOn(repo, 'listSquashSubscriptions').mockResolvedValue([
      {
        id: 'sub-1',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2025-01-01',
        created_at: '2024-01-01',
        packages: { id: 'pkg-1', name_en: 'Pro', name_ar: 'برو', duration_days: 30 },
      },
    ] as never);

    const result = await getProfile('user-1');

    expect(findUserById).toHaveBeenCalledWith('user-1');
    expect(repo.listSquashAccessibleVideos).toHaveBeenCalledWith('user-1');
    expect(repo.listSquashAccessibleCategories).toHaveBeenCalledWith('user-1');
    expect(repo.listSquashSubscriptions).toHaveBeenCalledWith('user-1', false);
    expect(result).toEqual({
      userData: {
        full_name: 'Test Trainee',
        email: 'trainee@example.com',
        phone: '123',
        created_at: null,
        is_coach: false,
      },
      videoCount: 2,
      categoryCount: 1,
      subscriptions: [
        {
          id: 'sub-1',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          created_at: '2024-01-01',
          packages: { id: 'pkg-1', name_en: 'Pro', name_ar: 'برو', duration_days: 30 },
        },
      ],
    });
  });
});
