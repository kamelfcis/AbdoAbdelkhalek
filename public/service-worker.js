// Service Worker for aggressive caching and offline support
// Optimized for better performance
const CACHE_VERSION = 'v5';
const CACHE_NAME = `abdelrhman-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Assets to cache immediately (critical resources)
const PRECACHE_ASSETS = [
  '/logo.png',
  '/favicon.ico',
];

// Cache duration settings
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
  runtime: 24 * 60 * 60 * 1000, // 1 day
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('Service Worker: Some precache assets failed', err);
        });
      }),
      // Pre-cache static JS and CSS chunks
      caches.open(STATIC_CACHE).then((cache) => {
        // Cache will be populated on first fetch
        return Promise.resolve();
      }),
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete all caches that don't match current version
            return !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Claim clients immediately for faster activation
      return self.clients.claim();
    })
  );
});

// Fetch event - optimized caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API — always network (stale cached API is a common "stuck" bug)
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip HTML / navigations — never cache index.html
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.endsWith('/index.html')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip Supabase API requests (they need to be fresh)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Skip Chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy: Cache First for images and hashed static assets
  if (
    event.request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
  ) {
    // Images: Cache First with long expiration
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'font' ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)
  ) {
    // Static assets: Cache First
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Other GET requests: Network First, fallback to cache (never HTML/API — skipped above)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response for caching
        const responseToCache = response.clone();

        // Cache successful responses
        if (response && response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page if available
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});


