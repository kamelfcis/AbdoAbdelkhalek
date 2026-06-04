import { describe, expect, it } from 'vitest';
import {
  filterLegacyFitnessUserIds,
  mergeFitnessTraineeUserIds,
} from '../../src/infrastructure/prisma/fitness-trainee-scope.js';

describe('fitness trainee scope', () => {
  it('merges all fitness trainee id sources without duplicates', () => {
    expect(
      mergeFitnessTraineeUserIds({
        videoAccess: ['a', 'b'],
        categoryAccess: ['b', 'c'],
        subscription: ['c', 'd'],
        registeredFitness: ['d', 'e'],
        legacyNull: ['e', 'f'],
      })
    ).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('includes legacy null users except squash-only trainees', () => {
    expect(
      filterLegacyFitnessUserIds(
        ['legacy-1', 'legacy-2', 'squash-only'],
        ['squash-only', 'other-squash']
      )
    ).toEqual(['legacy-1', 'legacy-2']);
  });

  it('keeps users with both fitness and squash entitlements in legacy set', () => {
    const legacy = filterLegacyFitnessUserIds(
      ['dual-domain-user'],
      ['dual-domain-user']
    );
    expect(legacy).toEqual([]);
    expect(
      mergeFitnessTraineeUserIds({
        videoAccess: ['dual-domain-user'],
        categoryAccess: [],
        subscription: [],
        registeredFitness: [],
        legacyNull: legacy,
      })
    ).toEqual(['dual-domain-user']);
  });
});
