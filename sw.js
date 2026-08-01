// AiWay service worker — fast app-shell startup + background refresh.
// API requests are never intercepted.
const CACHE_VERSION = 'aiway-shell-v5';
const SHELL_ASSETS = ['/', '/index.html', '/aiway-logo.png', '/manifest.json'];

async function refreshShell() {
  const cache = await caches.open(CACHE_VERSION);
  await Promise.allSettled(SHELL_ASSETS.map(async (asset) => {
    const response = await fetch(asset, { cache: 'no-cache' });
    if (response && response.ok) await cache.put(asset, response.clone());
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(refreshShell().catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'AIWAY_REFRESH_SHELL') event.waitUntil(refreshShell().catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match('/index.html');
      const network = fetch(request, { cache: 'no-cache' }).then(async (response) => {
        if (response && response.ok) await cache.put('/index.html', response.clone());
        return response;
      });
      // Existing visitors get an immediate cached shell; network refreshes it silently.
      if (cached) {
        event.waitUntil(network.catch(() => {}));
        return cached;
      }
      return network.catch(() => caches.match('/index.html'));
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok && ['image','manifest'].includes(request.destination)) await cache.put(request, response.clone());
    return response;
  })());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'AiWay', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'AiWay';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '', icon: data.icon || '/aiway-logo.png', badge: data.badge || '/aiway-logo.png',
    dir: 'auto', tag: data.tag || 'aiway-notification', renotify: Boolean(data.tag), data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) { client.navigate(targetUrl); return client.focus(); }
    }
    return clients.openWindow(targetUrl);
  }));
});
