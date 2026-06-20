/* ============================================================
   Apex Community Hub — sw.js
   Service Worker: caches all pages and assets for offline use
   ============================================================ */

const CACHE_NAME = 'apex-hub-v2';

const PRECACHE = [
  '/',
  '/index.html',
  '/directory.html',
  '/featured.html',
  '/events.html',
  '/about.html',
  '/brief.html',
  '/references.html',
  '/submit.html',
  '/404.html',
  '/styles.css',
  '/main.js',
  '/enhancements.js'
];

/* ── Install: pre-cache all core pages ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: delete old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for pages/assets, network-first for external ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
