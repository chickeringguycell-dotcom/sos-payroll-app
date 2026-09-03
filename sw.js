const CACHE_NAME = 'sos-suite-live-v61';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './SOS_Payroll.html',
  './SOS_Timecard.html',
  './timecard.html',
  './timecard/index.html',
  './sos_timecard_logo.png',
  './logo.png',
  './icon-192-tc.png',
  './icon-512-tc.png',
  './apple-touch-icon-tc.png',
  './favicon-tc.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  let payload = { title: '🚨 SOS Geofence Alert', body: 'New off-site punch detected!' };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) payload.body = event.data.text();
  }

  const options = {
    body: payload.body,
    icon: './logo.png',
    badge: './logo.png',
    tag: 'sos-push-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 200, 400, 200, 400]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        client.focus();
        return client.navigate('./');
      }
      return clients.openWindow('./');
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
