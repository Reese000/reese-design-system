/* ═══════════════════════════════════════════════════════════════
   REESE DESIGN SYSTEM — Service Worker v1.2
   Offline-first caching for design system files.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'reese-ds-v1.2';
const ASSETS = [
  './',
  './tokens.css',
  './icons.css',
  './icons.svg',
  './demo.html',
  './index.html',
  './README.md',
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./demo.html');
        }
      });
    })
  );
});
