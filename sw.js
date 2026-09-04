// ============================================================================
// SPOTLESS SOLUTIONS PWA SERVICE WORKER & LIVE AUTO-UPDATE ENGINE
// Supports: Windows PC, Android Phone, and Apple iPhone (iOS 16.4+ Home-Screen PWA)
// ============================================================================

const CACHE_NAME = 'sos-pwa-engine-v96';
const STATIC_ASSETS = [
  './',
  'manifest.json',
  'manifest-payroll.json',
  'manifest-timecard.json',
  'manifest-estimator.json',
  'apple-touch-icon.png',
  'apple-touch-icon-tc.png',
  'favicon.png',
  'favicon.ico',
  'icon-192.png',
  'icon-192-pay.png',
  'icon-192-tc.png',
  'icon-192-est.png',
  'icon-512.png',
  'icon-512-tc.png',
  'sos_pwa_push.js',
  'sos_alert_hub.js',
  'supabase_sync.js'
];

// INSTALL: Cache static shell assets and activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE: Purge old cache versions and claim all open clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim()).then(() => {
      // Notify all active clients that an auto-update has been applied
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_VERSION_ACTIVATED',
            version: CACHE_NAME,
            timestamp: new Date().toISOString()
          });
        });
      });
    })
  );
});

// MESSAGE: Client-initiated controls
self.addEventListener('message', (event) => {
  if (event.data && (event.data.action === 'skipWaiting' || event.data.type === 'CHECK_FOR_UPDATE')) {
    self.skipWaiting();
  }
});

// FETCH: Network-First for dynamic HTML & data; Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtml = req.mode === 'navigate' || req.destination === 'document' || req.url.includes('.html');

  if (isHtml) {
    // Network-first for HTML documents to guarantee live synchronization
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-while-revalidate for images, icons, and static scripts
  event.respondWith(
    caches.match(req).then((cached) => {
      const networked = fetch(req).then((res) => {
        if (res && res.status === 200 && req.method === 'GET' && !req.url.includes('/api/')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networked;
    })
  );
});

// ============================================================================
// WEB PUSH NOTIFICATION HANDLER (Android, iOS PWA & Windows PC)
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('[SW] Web Push Event Received in Background:', event);
  
  let payload = {
    title: '🚨 Spotless Solutions Alert',
    body: 'New live business update received.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'sos-alert-' + Date.now(),
    data: {
      url: 'SOS_Payroll.html',
      timestamp: new Date().toISOString()
    }
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      payload.title = dataJson.title || payload.title;
      payload.body = dataJson.body || payload.body;
      payload.icon = dataJson.icon || payload.icon;
      payload.badge = dataJson.badge || payload.badge;
      payload.tag = dataJson.tag || payload.tag;
      if (dataJson.data) {
        payload.data = Object.assign({}, payload.data, dataJson.data);
      }
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: payload.data,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// ============================================================================
// NOTIFICATION CLICK HANDLER
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : 'SOS_Payroll.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl.split('#')[0]) && 'focus' in client) {
          if (event.notification.data && event.notification.data.event_id) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: event.notification.data
            });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
