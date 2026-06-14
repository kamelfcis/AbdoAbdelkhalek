import { useEffect } from 'react';

const MOBILE_MQ = '(max-width: 768px)';

/**
 * Mobile: fixed header + dynamic spacer (immune to ancestor overflow).
 * Desktop: sticky via .site-header CSS; spacer hidden.
 */
export function useSiteHeaderLayout(headerRef) {
  useEffect(() => {
    const header = headerRef?.current;
    if (!header?.classList.contains('site-header')) return undefined;

    const spacer = document.createElement('div');
    spacer.className = 'site-header-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    header.insertAdjacentElement('afterend', spacer);

    const mq = window.matchMedia(MOBILE_MQ);

    const sync = () => {
      const isMobile = mq.matches;
      header.dataset.layout = isMobile ? 'fixed' : 'sticky';

      if (isMobile) {
        spacer.hidden = false;
        const height = header.getBoundingClientRect().height;
        spacer.style.height = `${height}px`;
        document.documentElement.style.setProperty('--site-header-height', `${height}px`);
      } else {
        spacer.hidden = true;
        spacer.style.height = '';
        document.documentElement.style.removeProperty('--site-header-height');
      }
    };

    const ro = new ResizeObserver(sync);
    ro.observe(header);
    mq.addEventListener('change', sync);
    window.addEventListener('orientationchange', sync);

    sync();

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', sync);
      window.removeEventListener('orientationchange', sync);
      document.documentElement.style.removeProperty('--site-header-height');
      spacer.remove();
    };
  }, [headerRef]);
}
