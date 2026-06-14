export type LandingDomain = 'fitness' | 'squash';

export interface LandingSectionDef {
  key: string;
  anchorId: string;
  icon: string;
  labelKey: string;
}

export const LANDING_SECTIONS_BY_DOMAIN: Record<LandingDomain, LandingSectionDef[]> = {
  fitness: [
    { key: 'reviews', anchorId: 'reviews', icon: 'star', labelKey: 'landing-section-reviews' },
    { key: 'categories', anchorId: 'categories', icon: 'folder', labelKey: 'landing-section-categories' },
    { key: 'videos', anchorId: 'videos', icon: 'video', labelKey: 'landing-section-videos' },
    { key: 'packages', anchorId: 'packages', icon: 'box', labelKey: 'landing-section-packages' },
    { key: 'faq', anchorId: 'faq', icon: 'question-circle', labelKey: 'landing-section-faq' },
  ],
  squash: [
    { key: 'reviews', anchorId: 'reviews', icon: 'star', labelKey: 'landing-section-reviews' },
    { key: 'categories', anchorId: 'categories', icon: 'folder', labelKey: 'landing-section-categories' },
    { key: 'videos', anchorId: 'videos', icon: 'video', labelKey: 'landing-section-videos' },
    { key: 'packages', anchorId: 'packages', icon: 'box', labelKey: 'landing-section-packages' },
    { key: 'coaches', anchorId: 'coaches', icon: 'user-tie', labelKey: 'landing-section-coaches' },
    { key: 'programs', anchorId: 'programs', icon: 'clipboard-list', labelKey: 'landing-section-programs' },
    { key: 'faq', anchorId: 'faq', icon: 'question-circle', labelKey: 'landing-section-faq' },
  ],
};

export function getSectionKeys(domain: LandingDomain): string[] {
  return LANDING_SECTIONS_BY_DOMAIN[domain].map((s) => s.key);
}

export function defaultSectionsMap(domain: LandingDomain): Record<string, boolean> {
  return Object.fromEntries(getSectionKeys(domain).map((key) => [key, true]));
}

export function isValidLandingDomain(value: string): value is LandingDomain {
  return value === 'fitness' || value === 'squash';
}
