/* ==========================================
   DramaStream Service Worker - Self-Destruct
   Clears all caches and unregisters itself
   ========================================== */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => {
        console.log('[SW] Caches cleared and Service Worker unregistered successfully.');
      })
  );
});
