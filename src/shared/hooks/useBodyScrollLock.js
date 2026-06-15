import { useEffect } from 'react';

const SCROLL_Y_KEY = 'scrollY';

function lockBodyScroll() {
  const y = window.scrollY;
  document.body.dataset[SCROLL_Y_KEY] = String(y);
  document.body.style.position = 'fixed';
  document.body.style.top = `-${y}px`;
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  const y = parseInt(document.body.dataset[SCROLL_Y_KEY] || '0', 10);
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  delete document.body.dataset[SCROLL_Y_KEY];
  window.scrollTo(0, y);
}

/**
 * Locks body scroll while preserving the current scroll position.
 * Restores scroll on close and on unmount.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
