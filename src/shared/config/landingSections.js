/** Landing section registry — shared between public pages and dashboard settings. */

export const LANDING_SECTIONS_BY_DOMAIN = {
  fitness: [
    { key: 'success-stories', anchorId: 'success', icon: 'trophy', labelKey: 'landing-section-success-stories', descKey: 'landing-section-success-stories-desc' },
    { key: 'reviews', anchorId: 'reviews', icon: 'star', labelKey: 'landing-section-reviews', descKey: 'landing-section-reviews-desc' },
    { key: 'categories', anchorId: 'categories', icon: 'folder', labelKey: 'landing-section-categories', descKey: 'landing-section-categories-desc' },
    { key: 'videos', anchorId: 'videos', icon: 'video', labelKey: 'landing-section-videos', descKey: 'landing-section-videos-desc' },
    { key: 'packages', anchorId: 'packages', icon: 'box', labelKey: 'landing-section-packages', descKey: 'landing-section-packages-desc' },
    { key: 'faq', anchorId: 'faq', icon: 'question-circle', labelKey: 'landing-section-faq', descKey: 'landing-section-faq-desc' },
  ],
  squash: [
    { key: 'reviews', anchorId: 'reviews', icon: 'star', labelKey: 'landing-section-reviews', descKey: 'landing-section-reviews-desc' },
    { key: 'categories', anchorId: 'categories', icon: 'folder', labelKey: 'landing-section-categories', descKey: 'landing-section-categories-desc' },
    { key: 'videos', anchorId: 'videos', icon: 'video', labelKey: 'landing-section-videos', descKey: 'landing-section-videos-desc' },
    { key: 'packages', anchorId: 'packages', icon: 'box', labelKey: 'landing-section-packages', descKey: 'landing-section-packages-desc' },
    { key: 'coaches', anchorId: 'coaches', icon: 'user-tie', labelKey: 'landing-section-coaches', descKey: 'landing-section-coaches-desc' },
    { key: 'programs', anchorId: 'programs', icon: 'clipboard-list', labelKey: 'landing-section-programs', descKey: 'landing-section-programs-desc' },
    { key: 'faq', anchorId: 'faq', icon: 'question-circle', labelKey: 'landing-section-faq', descKey: 'landing-section-faq-desc' },
  ],
};

/** Map DOM anchor / sidebar slug → registry visibility key. */
export const SECTION_SLUG_TO_KEY = {
  success: 'success-stories',
  reviews: 'reviews',
  categories: 'categories',
  videos: 'videos',
  packages: 'packages',
  coaches: 'coaches',
  programs: 'programs',
  faq: 'faq',
};

export function getLandingSectionsForDomain(domain) {
  return LANDING_SECTIONS_BY_DOMAIN[domain] || LANDING_SECTIONS_BY_DOMAIN.fitness;
}

export function isSectionVisible(sections, key) {
  return sections?.[key] !== false;
}

export function resolveVisibilityKey(sectionSlug) {
  return SECTION_SLUG_TO_KEY[sectionSlug] ?? null;
}

export function isSlugVisible(sections, sectionSlug) {
  const key = resolveVisibilityKey(sectionSlug);
  if (!key) return true;
  return isSectionVisible(sections, key);
}
