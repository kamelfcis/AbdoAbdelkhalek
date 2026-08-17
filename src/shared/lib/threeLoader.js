/**
 * Deferred Three.js loader: dynamic import + IntersectionObserver.
 * Avoids shipping the npm `three` chunk until a canvas is on screen.
 */

let threeJSPromise = null;
let isThreeJSLoading = false;
let threeJSLoaded = false;

function assignWindowThree(mod) {
  const THREE = mod?.default && mod.Scene ? mod.default : mod;
  if (typeof window !== 'undefined') {
    window.THREE = THREE;
  }
  return THREE;
}

/**
 * Load Three.js via code-split `import('three')`, with CDN fallback.
 * @returns {Promise<boolean>}
 */
export const loadThreeJS = () => {
  if (threeJSPromise) {
    return threeJSPromise;
  }

  if (typeof window !== 'undefined' && window.THREE) {
    threeJSLoaded = true;
    return Promise.resolve(true);
  }

  if (isThreeJSLoading) {
    return threeJSPromise;
  }

  isThreeJSLoading = true;

  threeJSPromise = import(/* webpackChunkName: "three-lib" */ 'three')
    .then((mod) => {
      assignWindowThree(mod);
      threeJSLoaded = true;
      isThreeJSLoading = false;
      return true;
    })
    .catch(() => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.loadThreeJS) {
          window.loadThreeJS();
        } else if (typeof document !== 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.async = true;
          script.defer = true;
          script.onerror = () => {
            isThreeJSLoading = false;
            reject(new Error('Failed to load Three.js'));
          };
          document.head.appendChild(script);
        }

        let checkCount = 0;
        const maxChecks = 50;
        const checkInterval = setInterval(() => {
          checkCount += 1;
          if (typeof window !== 'undefined' && window.THREE) {
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
      });
    });

  return threeJSPromise;
};

/**
 * Load Three.js when element enters viewport using Intersection Observer.
 * @param {HTMLElement} element
 * @param {Object} options
 * @returns {Function} Cleanup function
 */
export const loadThreeJSOnIntersect = (element, options = {}) => {
  if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    loadThreeJS().catch((error) => {
      console.warn('Three.js loading failed:', error);
    });
    return () => {};
  }

  const { rootMargin = '100px', threshold = 0.1, once = true } = options;

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

  return () => {
    if (observer) {
      observer.disconnect();
    }
    isObserving = false;
  };
};

/**
 * Load Three.js on user interaction.
 * @param {Array<string>} events
 * @returns {Function} Cleanup function
 */
export const loadThreeJSOnInteraction = (
  events = ['scroll', 'touchstart', 'click', 'mousemove']
) => {
  if (threeJSLoaded || isThreeJSLoading) {
    return () => {};
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

  const timeoutId = setTimeout(() => {
    if (!loaded) {
      loadOnInteraction();
    }
  }, 8000);

  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, loadOnInteraction);
    });
    clearTimeout(timeoutId);
  };
};

export const isThreeJSReady = () => {
  return threeJSLoaded || (typeof window !== 'undefined' && !!window.THREE);
};
