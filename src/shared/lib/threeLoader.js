/**
 * Professional Three.js Loader Utility
 * Handles deferred loading with Intersection Observer and user interaction
 */

let threeJSPromise = null;
let isThreeJSLoading = false;
let threeJSLoaded = false;

/**
 * Load Three.js library dynamically
 * @returns {Promise<boolean>} Promise that resolves when Three.js is loaded
 */
export const loadThreeJS = () => {
  // Return cached promise if already loading or loaded
  if (threeJSPromise) {
    return threeJSPromise;
  }

  if (window.THREE) {
    threeJSLoaded = true;
    return Promise.resolve(true);
  }

  if (isThreeJSLoading) {
    return threeJSPromise;
  }

  isThreeJSLoading = true;

  threeJSPromise = new Promise((resolve, reject) => {
    // Check if loadThreeJS function exists (from index.html)
    if (window.loadThreeJS) {
      window.loadThreeJS();
      
      // Poll for THREE to be available
      let checkCount = 0;
      const maxChecks = 50; // 10 seconds max wait
      const checkInterval = setInterval(() => {
        checkCount++;
        if (window.THREE) {
          clearInterval(checkInterval);
          threeJSLoaded = true;
          isThreeJSLoading = false;
          resolve(true);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          isThreeJSLoading = false;
          reject(new Error('Three.js failed to load within timeout'));
        }
      }, 200);
    } else {
      // Fallback: Load Three.js directly
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        threeJSLoaded = true;
        isThreeJSLoading = false;
        resolve(true);
      };
      script.onerror = () => {
        isThreeJSLoading = false;
        reject(new Error('Failed to load Three.js'));
      };
      document.head.appendChild(script);
    }
  });

  return threeJSPromise;
};

/**
 * Load Three.js when element enters viewport using Intersection Observer
 * @param {HTMLElement} element - Element to observe
 * @param {Object} options - Intersection Observer options
 * @returns {Function} Cleanup function
 */
export const loadThreeJSOnIntersect = (element, options = {}) => {
  if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately if IntersectionObserver not supported
    return loadThreeJS();
  }

  const {
    rootMargin = '100px',
    threshold = 0.1,
    once = true,
  } = options;

  let observer;
  let isObserving = true;

  const handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && isObserving) {
        loadThreeJS().catch((error) => {
          console.warn('Three.js loading failed:', error);
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
 * Load Three.js on user interaction
 * @param {Array<string>} events - Events to listen for
 * @returns {Function} Cleanup function
 */
export const loadThreeJSOnInteraction = (events = ['scroll', 'touchstart', 'click', 'mousemove']) => {
  if (threeJSLoaded || isThreeJSLoading) {
    return () => {}; // No-op cleanup
  }

  let loaded = false;
  const loadOnInteraction = () => {
    if (!loaded) {
      loaded = true;
      loadThreeJS().catch((error) => {
        console.warn('Three.js loading failed:', error);
      });
      events.forEach((event) => {
        window.removeEventListener(event, loadOnInteraction);
      });
    }
  };

  events.forEach((event) => {
    window.addEventListener(event, loadOnInteraction, { once: true, passive: true });
  });

  // Fallback: load after 5 seconds
  const timeoutId = setTimeout(() => {
    if (!loaded) {
      loadOnInteraction();
    }
  }, 5000);

  // Cleanup function
  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, loadOnInteraction);
    });
    clearTimeout(timeoutId);
  };
};

/**
 * Check if Three.js is loaded
 * @returns {boolean}
 */
export const isThreeJSReady = () => {
  return threeJSLoaded || (typeof window !== 'undefined' && !!window.THREE);
};


