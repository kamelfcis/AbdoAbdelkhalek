import React, { useState, useEffect } from 'react';
import { loadFontAwesome } from '../../../shared/lib/fontAwesomeLoader';

const SquashScrollToTop = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadFontAwesome({ priority: 'low' }).catch(() => {});
  }, []);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      type="button"
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up text-xl md:text-2xl" aria-hidden="true" />
    </button>
  );
});

SquashScrollToTop.displayName = 'SquashScrollToTop';

export default SquashScrollToTop;
