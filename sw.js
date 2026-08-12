/* ═══════════════════════════════════════════════════════════════
   REESE DESIGN SYSTEM — Service Worker v1.2
   Offline-first caching for design system files.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'reese-ds-v1.5';
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

// Fetch — network-first for HTML (avoid sticky broken builds), cache-first for assets
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    // Network-first for HTML — always get latest
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./demo.html')))
    );
  } else {
    // Cache-first for CSS/JS/SVG assets
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
      })
    );
  }
});
