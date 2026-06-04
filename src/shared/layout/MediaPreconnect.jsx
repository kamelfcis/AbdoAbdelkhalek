import { useEffect } from 'react';
import { getMediaBase } from '../lib/cdn';

/**
 * Inject preconnect/dns-prefetch for the active media CDN origin.
 */
export default function MediaPreconnect() {
  useEffect(() => {
    const base = getMediaBase();
    if (!base) return;

    let origin;
    try {
      origin = new URL(base).origin;
    } catch {
      return;
    }

    const links = [
      { rel: 'preconnect', href: origin, crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: origin },
    ];

    const created = links.map(({ rel, href, crossOrigin }) => {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return null;
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      created.forEach((link) => link?.remove());
    };
  }, []);

  return null;
}
