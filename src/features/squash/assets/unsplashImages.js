/**
 * Curated Unsplash URLs for squash landing (verified CDN IDs).
 * Slugs: NQaK7kIYkeg, 3HSBcnyoE58, zU_IB_IwCNo, imRNrA5NssU
 */
const base = (id, w = 1920, q = 80) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=${q}`;

const SQUASH_COURT_EMPTY = '1740813416116-a07511d2e188';
const SQUASH_COURT_READY = '1740813416102-5d42f408bc85';
const RACKET_ON_COURT = '1737229373530-4e982d21c8c3';
const RACKET_CLOSEUP = '1615326882458-e0d45b097f55';

export const squashPortalImage = base(RACKET_ON_COURT, 1400, 85);

export const unsplashImages = {
  heroSlide1: base(SQUASH_COURT_EMPTY, 1920, 85),
  heroSlide1Mobile: base(SQUASH_COURT_EMPTY, 640, 60),
  heroSlide2: base(SQUASH_COURT_READY, 1920, 85),
  heroSlide2Mobile: base(SQUASH_COURT_READY, 640, 60),
  heroSlide3: base(RACKET_ON_COURT, 1920, 85),
  heroSlide3Mobile: base(RACKET_ON_COURT, 640, 60),
  hero: base(SQUASH_COURT_EMPTY, 1400, 85),
  heroMobile: base(SQUASH_COURT_EMPTY, 640, 60),
  about: base(SQUASH_COURT_EMPTY, 1200, 80),
  whyChoose: base(SQUASH_COURT_READY, 1400, 75),
  court: base(SQUASH_COURT_READY, 1600, 75),
  coach: base(RACKET_ON_COURT, 1024, 80),
  program: base(RACKET_CLOSEUP, 1000, 80),
  transformation: base('1534438327276-14e5300c3a48', 1200, 80),
  review: base(RACKET_ON_COURT, 800, 75),
  contact: base(SQUASH_COURT_READY, 1400, 70),
};

const HERO_SLIDE_KEYS = ['heroSlide1', 'heroSlide2', 'heroSlide3'];

export function getUnsplashUrl(key, isMobile = false) {
  if (key === 'hero') {
    return isMobile ? unsplashImages.heroMobile : unsplashImages.hero;
  }
  if (HERO_SLIDE_KEYS.includes(key)) {
    const mobileKey = `${key}Mobile`;
    if (isMobile && unsplashImages[mobileKey]) return unsplashImages[mobileKey];
    return unsplashImages[key] || unsplashImages.court;
  }
  return unsplashImages[key] || unsplashImages.court;
}

/** Fallback when a slide image fails to load */
export function getSquashImageFallback() {
  return unsplashImages.court;
}

export default unsplashImages;
