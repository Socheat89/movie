/* ===========================
   DramaStream Service Worker
   Cache-first for app shell,
   Network-first for dynamic content
=========================== */

const CACHE_NAME = 'dramastream-v1.0';
const SHELL_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/embed.js',
  './js/pages/home.js',
  './js/pages/watch.js',
  './js/pages/admin.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── Install: cache the app shell ──────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing DramaStream v1.0...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => {
        console.log('[SW] Shell assets cached.');
        return self.skipWaiting();
      })
      .catch(err => console.warn('[SW] Cache failed:', err))
  );
});

// ── Activate: purge old caches ─────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first strategy ────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Bypass: external video embeds & fonts (let browser handle these)
  const bypassHosts = ['youtube.com', 'youtu.be', 'facebook.com', 'fb.watch', 'tiktok.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'picsum.photos'];
  if (bypassHosts.some(h => url.hostname.includes(h))) return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Serve from cache, revalidate in background
        fetch(request)
          .then(freshResponse => {
            if (freshResponse && freshResponse.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, freshResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache: fetch from network
      return fetch(request).then(networkResponse => {
        if (!networkResponse || !networkResponse.ok) return networkResponse;

        // Cache same-origin responses
        if (url.origin === self.location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
