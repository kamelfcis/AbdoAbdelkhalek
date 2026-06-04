/** Pure helpers for fitness trainee domain scoping (testable without DB). */

export function mergeFitnessTraineeUserIds(parts: {
  videoAccess: string[];
  categoryAccess: string[];
  subscription: string[];
  registeredFitness: string[];
  legacyNull: string[];
}): string[] {
  return [
    ...new Set([
      ...parts.videoAccess,
      ...parts.categoryAccess,
      ...parts.subscription,
      ...parts.registeredFitness,
      ...parts.legacyNull,
    ]),
  ];
}

/** Legacy users with null registered_from, excluding squash-only trainees. */
export function filterLegacyFitnessUserIds(
  legacyNullUserIds: string[],
  squashEntitledUserIds: string[]
): string[] {
  const squash = new Set(squashEntitledUserIds);
  return legacyNullUserIds.filter((id) => !squash.has(id));
}
