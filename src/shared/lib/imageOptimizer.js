/**
 * Image URL helpers for responsive / CDN-friendly src.
 */

export function getOptimizedImageUrl(src, options = {}) {
  if (!src || typeof src !== 'string') return '';

  const { mode = 'default', mobileWidth = 640, tabletWidth = 1024, desktopWidth = 1280, width } =
    options;

  if (mode === 'thumb') {
    return src;
  }

  if (src.includes('unsplash.com') && src.includes('w=')) {
    const target = width || desktopWidth;
    return src.replace(/w=\d+/, `w=${target}`);
  }

  if (src.includes('unsplash.com')) {
    const target = width || desktopWidth;
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}w=${target}`;
  }

  return src;
}

export function generateSrcSet(src, options = {}) {
  if (!src || options.mode === 'thumb') return '';
  const widths = [640, 1024, 1280];
  return widths
    .map((w) => {
      const url = getOptimizedImageUrl(src, { ...options, desktopWidth: w });
      return `${url} ${w}w`;
    })
    .join(', ');
}

export function generateSizes(breakpoints = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw') {
  return breakpoints;
}
