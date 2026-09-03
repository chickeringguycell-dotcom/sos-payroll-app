const CACHE_NAME = 'sos-suite-live-v89';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// NETWORK-ONLY for HTML documents & navigation requests (Never serve cached HTML)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtml = req.mode === 'navigate' || req.destination === 'document' || req.url.includes('.html') || !req.url.includes('.');
  
  if (isHtml) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-while-revalidate for static image assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const networked = fetch(req).then((res) => {
        if (res && res.status === 200 && req.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networked;
    })
  );
});
