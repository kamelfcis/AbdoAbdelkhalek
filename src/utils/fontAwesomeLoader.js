/**
 * Professional Font Awesome Loader Utility
 * Handles deferred loading with priority and error handling
 */

let fontAwesomePromise = null;
let isFontAwesomeLoading = false;
let fontAwesomeLoaded = false;

const FONT_AWESOME_VERSION = '6.4.0';
const FONT_AWESOME_CDN = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FONT_AWESOME_VERSION}/css/all.min.css`;

/**
 * Load Font Awesome CSS dynamically
 * @param {Object} options - Loading options
 * @returns {Promise<boolean>} Promise that resolves when Font Awesome is loaded
 */
export const loadFontAwesome = (options = {}) => {
  const { priority = 'normal' } = options;

  // Return cached promise if already loading or loaded
  if (fontAwesomePromise && priority !== 'high') {
    return fontAwesomePromise;
  }

  if (fontAwesomeLoaded) {
    return Promise.resolve(true);
  }

  // Check if already loaded via link tag
  if (document.getElementById('fontawesome-css')) {
    const link = document.getElementById('fontawesome-css');
    if (link.sheet || link.href) {
      fontAwesomeLoaded = true;
      return Promise.resolve(true);
    }
  }

  // Check if window.loadFontAwesome exists (from index.html)
  if (window.loadFontAwesome && priority !== 'high') {
    window.loadFontAwesome();
    
    // Poll for Font Awesome to be available
    let checkCount = 0;
    const maxChecks = 30; // 6 seconds max wait
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        checkCount++;
        const link = document.getElementById('fontawesome-css');
        if (link && (link.sheet || link.href)) {
          clearInterval(checkInterval);
          fontAwesomeLoaded = true;
          isFontAwesomeLoading = false;
          resolve(true);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          isFontAwesomeLoading = false;
          // Don't reject, just resolve (graceful degradation)
          resolve(false);
        }
      }, 200);
    });
  }

  if (isFontAwesomeLoading && priority !== 'high') {
    return fontAwesomePromise;
  }

  isFontAwesomeLoading = true;

  fontAwesomePromise = new Promise((resolve) => {
    // Check if link already exists
    const existingLink = document.getElementById('fontawesome-css');
    if (existingLink) {
      fontAwesomeLoaded = true;
      isFontAwesomeLoading = false;
      resolve(true);
      return;
    }

    const link = document.createElement('link');
    link.id = 'fontawesome-css';
    link.rel = 'stylesheet';
    link.href = FONT_AWESOME_CDN;
    link.crossOrigin = 'anonymous';
    
    // Use media="print" trick for non-blocking load
    link.media = 'print';
    
    link.onload = () => {
      link.media = 'all';
      fontAwesomeLoaded = true;
      isFontAwesomeLoading = false;
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('fontawesome-loaded'));
      resolve(true);
    };
    
    link.onerror = () => {
      isFontAwesomeLoading = false;
      console.warn('Font Awesome failed to load, continuing without icons');
      // Graceful degradation - resolve anyway
      resolve(false);
    };

    // Insert in head, but after critical CSS
    const head = document.head || document.getElementsByTagName('head')[0];
    const firstLink = head.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      head.insertBefore(link, firstLink.nextSibling);
    } else {
      head.appendChild(link);
    }
  });

  return fontAwesomePromise;
};

/**
 * Load Font Awesome when element enters viewport
 * @param {HTMLElement} element - Element to observe
 * @param {Object} options - Intersection Observer options
 * @returns {Function} Cleanup function
 */
export const loadFontAwesomeOnIntersect = (element, options = {}) => {
  if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately
    return loadFontAwesome();
  }

  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true,
  } = options;

  let observer;
  let isObserving = true;

  const handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && isObserving) {
        loadFontAwesome().catch((error) => {
          console.warn('Font Awesome loading failed:', error);
        });
        
        if (once) {
          observer?.disconnect();
          isObserving = false;
        }
      }
    });
  };

  observer = new IntersectionObserver(handleIntersect, {
    rootMargin,
    threshold,
  });

  observer.observe(element);

  // Cleanup function
  return () => {
    if (observer) {
      observer.disconnect();
    }
    isObserving = false;
  };
};

/**
 * Check if Font Awesome is loaded
 * @returns {boolean}
 */
export const isFontAwesomeReady = () => {
  if (fontAwesomeLoaded) return true;
  
  const link = document.getElementById('fontawesome-css');
  return !!(link && (link.sheet || link.href));
};


