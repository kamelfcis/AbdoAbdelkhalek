import React, { useState, useEffect } from 'react';

const ScrollToTop = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  // Load Font Awesome if needed
  useEffect(() => {
    if (window.loadFontAwesome) {
      window.loadFontAwesome();
    }
  }, []);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-gradient-to-r from-[#bfd7ed] to-[#0074b7] text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0 animate-bounce-slow' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      type="button"
    >
      <i className="fas fa-arrow-up text-xl md:text-2xl" aria-hidden="true"></i>
    </button>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop;

