import { describe, expect, it, vi, beforeEach } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  landingPageSettings: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../../src/infrastructure/prisma/client.js', () => ({
  prisma: prismaMocks,
}));

import {
  getLandingSections,
  updateLandingSection,
} from '../../src/domains/shared/landing-settings/landing-settings.service.js';
import { ValidationError } from '../../src/common/errors/AppError.js';

describe('landing-settings service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all sections visible by default when no row exists', async () => {
    prismaMocks.landingPageSettings.findUnique.mockResolvedValue(null);

    const result = await getLandingSections('fitness');

    expect(result.domain).toBe('fitness');
    expect(result.sections).toEqual({
      reviews: true,
      categories: true,
      videos: true,
      packages: true,
      faq: true,
    });
  });

  it('returns squash defaults with 8 sections', async () => {
    prismaMocks.landingPageSettings.findUnique.mockResolvedValue(null);

    const result = await getLandingSections('squash');

    expect(Object.keys(result.sections)).toHaveLength(7);
    expect(result.sections.coaches).toBe(true);
    expect(result.sections.programs).toBe(true);
  });

  it('merges stored overrides with defaults', async () => {
    prismaMocks.landingPageSettings.findUnique.mockResolvedValue({
      domain: 'fitness',
      sections: { reviews: false },
      updatedAt: new Date(),
    });

    const result = await getLandingSections('fitness');

    expect(result.sections.reviews).toBe(false);
    expect(result.sections.categories).toBe(true);
  });

  it('persists toggle and returns updated map', async () => {
    prismaMocks.landingPageSettings.findUnique.mockResolvedValue(null);
    prismaMocks.landingPageSettings.upsert.mockResolvedValue({});

    const result = await updateLandingSection('fitness', 'reviews', false);

    expect(result.sections.reviews).toBe(false);
    expect(prismaMocks.landingPageSettings.upsert).toHaveBeenCalledWith({
      where: { domain: 'fitness' },
      create: expect.objectContaining({
        domain: 'fitness',
        sections: expect.objectContaining({ reviews: false }),
      }),
      update: expect.objectContaining({
        sections: expect.objectContaining({ reviews: false }),
      }),
    });
  });

  it('rejects invalid section key', async () => {
    prismaMocks.landingPageSettings.findUnique.mockResolvedValue(null);

    await expect(updateLandingSection('fitness', 'coaches', false)).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
