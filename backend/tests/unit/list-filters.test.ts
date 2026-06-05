import { describe, it, expect } from 'vitest';
import {
  applyListFilters,
  applySubscriptionListFilters,
  applyTraineeListFilters,
  prismaSearchOr,
  restFilterSuffix,
  restSubscriptionFilterSuffix,
  restTraineeFilterSuffix,
  traineeSearchClause,
} from '../../src/common/utils/list-filters.js';

describe('prismaSearchOr', () => {
  it('builds OR across bilingual fields', () => {
    expect(prismaSearchOr('yoga', [{ en: 'titleEn', ar: 'titleAr' }])).toEqual({
      OR: [
        { titleEn: { contains: 'yoga', mode: 'insensitive' } },
        { titleAr: { contains: 'yoga', mode: 'insensitive' } },
      ],
    });
  });
});

describe('applyListFilters', () => {
  it('returns search OR alone when no other filters', () => {
    expect(
      applyListFilters({}, { search: 'test' }, { searchFields: [{ en: 'titleEn', ar: 'titleAr' }] })
    ).toEqual({
      OR: [
        { titleEn: { contains: 'test', mode: 'insensitive' } },
        { titleAr: { contains: 'test', mode: 'insensitive' } },
      ],
    });
  });

  it('wraps search with AND when combined with scalar filters', () => {
    expect(
      applyListFilters(
        { isPublic: true },
        { search: 'test', categoryId: 'cat-1', isPublic: true },
        {
          searchFields: [{ en: 'titleEn', ar: 'titleAr' }],
          categoryField: 'categoryId',
        }
      )
    ).toEqual({
      AND: [
        { isPublic: true, categoryId: 'cat-1' },
        {
          OR: [
            { titleEn: { contains: 'test', mode: 'insensitive' } },
            { titleAr: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });

  it('searches bilingual category name and description fields', () => {
    const categoryFields = [
      { en: 'nameEn', ar: 'nameAr' },
      { en: 'descriptionEn', ar: 'descriptionAr' },
    ];
    expect(applyListFilters({}, { search: 'strength' }, { searchFields: categoryFields })).toEqual({
      OR: [
        { nameEn: { contains: 'strength', mode: 'insensitive' } },
        { nameAr: { contains: 'strength', mode: 'insensitive' } },
        { descriptionEn: { contains: 'strength', mode: 'insensitive' } },
        { descriptionAr: { contains: 'strength', mode: 'insensitive' } },
      ],
    });
    expect(
      applyListFilters({}, { search: 'strength', isPublic: false }, { searchFields: categoryFields })
    ).toEqual({
      AND: [
        { isPublic: false },
        {
          OR: [
            { nameEn: { contains: 'strength', mode: 'insensitive' } },
            { nameAr: { contains: 'strength', mode: 'insensitive' } },
            { descriptionEn: { contains: 'strength', mode: 'insensitive' } },
            { descriptionAr: { contains: 'strength', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });
});

describe('restFilterSuffix', () => {
  it('includes search ilike or clause', () => {
    expect(restFilterSuffix({ search: 'yoga' }, ['title_en', 'title_ar'])).toBe(
      '&or=(title_en.ilike.*yoga*,title_ar.ilike.*yoga*)'
    );
  });

  it('includes category description fields in REST search', () => {
    expect(
      restFilterSuffix({ search: 'core' }, ['name_en', 'name_ar', 'description_en', 'description_ar'])
    ).toBe(
      '&or=(name_en.ilike.*core*,name_ar.ilike.*core*,description_en.ilike.*core*,description_ar.ilike.*core*)'
    );
  });
});

describe('applySubscriptionListFilters', () => {
  it('searches trainee name and email', () => {
    expect(applySubscriptionListFilters({}, { search: 'ali' })).toEqual({
      OR: [
        { user: { fullName: { contains: 'ali', mode: 'insensitive' } } },
        { user: { email: { contains: 'ali', mode: 'insensitive' } } },
      ],
    });
  });

  it('combines domain scope with status, package, and date filters', () => {
    expect(
      applySubscriptionListFilters(
        { packageId: { in: ['pkg-1', 'pkg-2'] } },
        {
          search: 'sara',
          status: 'active',
          packageId: 'pkg-2',
          endDateFrom: '2025-01-01',
          endDateTo: '2025-12-31',
        }
      )
    ).toEqual({
      AND: [
        {
          packageId: 'pkg-2',
          status: 'active',
          endDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-12-31T23:59:59.999Z'),
          },
        },
        {
          OR: [
            { user: { fullName: { contains: 'sara', mode: 'insensitive' } } },
            { user: { email: { contains: 'sara', mode: 'insensitive' } } },
          ],
        },
      ],
    });
  });
});

describe('traineeSearchClause', () => {
  it('searches name, email, and phone', () => {
    expect(traineeSearchClause('ali')).toEqual({
      OR: [
        { fullName: { contains: 'ali', mode: 'insensitive' } },
        { email: { contains: 'ali', mode: 'insensitive' } },
        { phone: { contains: 'ali', mode: 'insensitive' } },
      ],
    });
  });
});

describe('applyTraineeListFilters', () => {
  it('combines registration source, created date, and subscription status', () => {
    expect(
      applyTraineeListFilters(
        { id: { in: ['u1'] }, isCoach: false },
        {
          search: 'sara',
          registeredFrom: 'online_football',
          createdDateFrom: '2025-01-01',
          createdDateTo: '2025-06-30',
          subscriptionStatus: 'active',
        },
        { packageId: { in: ['pkg-1'] } }
      )
    ).toEqual({
      AND: [
        {
          AND: [
            { id: { in: ['u1'] }, isCoach: false },
            { registeredFrom: { in: ['online_football', 'fitness'] } },
            {
              createdAt: {
                gte: new Date('2025-01-01'),
                lte: new Date('2025-06-30T23:59:59.999Z'),
              },
            },
            {
              subscriptions: {
                some: {
                  packageId: { in: ['pkg-1'] },
                  status: 'active',
                },
              },
            },
          ],
        },
        {
          OR: [
            { fullName: { contains: 'sara', mode: 'insensitive' } },
            { email: { contains: 'sara', mode: 'insensitive' } },
            { phone: { contains: 'sara', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });

  it('filters trainees without subscriptions', () => {
    expect(
      applyTraineeListFilters(
        { isCoach: false },
        { subscriptionStatus: 'none' },
        { packageId: { in: ['pkg-1'] } }
      )
    ).toEqual({
      AND: [
        { isCoach: false },
        { subscriptions: { none: { packageId: { in: ['pkg-1'] } } } },
      ],
    });
  });
});

describe('restTraineeFilterSuffix', () => {
  it('includes registration source, created date, and phone search', () => {
    expect(
      restTraineeFilterSuffix({
        search: 'john',
        registeredFrom: 'legacy',
        createdDateFrom: '2025-01-01',
        createdDateTo: '2025-06-30',
      })
    ).toBe(
      '&registered_from=is.null&created_at=gte.2025-01-01&created_at=lte.2025-06-30T23%3A59%3A59.999Z&or=(full_name.ilike.*john*,email.ilike.*john*,phone.ilike.*john*)'
    );
  });
});

describe('restSubscriptionFilterSuffix', () => {
  it('includes trainee search and scalar filters', () => {
    expect(
      restSubscriptionFilterSuffix({
        search: 'john',
        status: 'active',
        packageId: 'pkg-1',
        startDateFrom: '2025-01-01',
        endDateTo: '2025-06-30',
      })
    ).toBe(
      '&status=eq.active&package_id=eq.pkg-1&start_date=gte.2025-01-01&end_date=lte.2025-06-30T23%3A59%3A59.999Z&or=(users.full_name.ilike.*john*,users.email.ilike.*john*)'
    );
  });
});
