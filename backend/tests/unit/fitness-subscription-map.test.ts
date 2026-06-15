import { describe, expect, it } from 'vitest';
import { mapFitnessSubscriptionRow } from '../../src/infrastructure/prisma/fitness-reads.js';

describe('mapFitnessSubscriptionRow', () => {
  it('maps Prisma subscription rows to dashboard snake_case shape', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-07-01T00:00:00.000Z');
    const created = new Date('2024-05-31T00:00:00.000Z');

    expect(
      mapFitnessSubscriptionRow({
        id: 'sub-1',
        userId: 'user-1',
        packageId: 'pkg-1',
        status: 'active',
        startDate: start,
        endDate: end,
        durationMonths: 1,
        createdAt: created,
        user: { fullName: 'Ahmed Ali', email: 'ahmed@example.com' },
        package: {
          id: 'pkg-1',
          nameEn: 'Pro Plan',
          nameAr: 'خطة برو',
          durationDays: 30,
        },
      })
    ).toEqual({
      id: 'sub-1',
      user_id: 'user-1',
      package_id: 'pkg-1',
      status: 'active',
      start_date: start,
      end_date: end,
      duration_months: 1,
      created_at: created,
      users: { full_name: 'Ahmed Ali', email: 'ahmed@example.com' },
      packages: {
        id: 'pkg-1',
        name_en: 'Pro Plan',
        name_ar: 'خطة برو',
        duration_days: 30,
      },
    });
  });

  it('omits users and packages when relations are missing', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-07-01T00:00:00.000Z');

    expect(
      mapFitnessSubscriptionRow({
        id: 'sub-2',
        userId: 'user-2',
        packageId: null,
        status: 'paused',
        startDate: start,
        endDate: end,
        durationMonths: 1,
        createdAt: null,
      })
    ).toEqual({
      id: 'sub-2',
      user_id: 'user-2',
      package_id: null,
      status: 'paused',
      start_date: start,
      end_date: end,
      duration_months: 1,
      created_at: null,
      users: undefined,
      packages: null,
    });
  });
});
