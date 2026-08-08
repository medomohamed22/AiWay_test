// AiWay service worker — reliable reloads on Pi Browser.
// API requests and normal page navigations use the network directly.
const CACHE_VERSION = 'aiway-static-v8';
const STATIC_ASSETS = ['/aiway-logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(STATIC_ASSETS.map(async (asset) => {
      const response = await fetch(asset, { cache: 'reload' });
      if (response && response.ok) await cache.put(asset, response.clone());
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Never serve HTML navigation from the app-shell cache. This avoids ERR_FAILED
  // after reloads in Pi Browser when an old or incomplete cached document exists.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request));
    return;
  }

  if (!['image', 'manifest'].includes(request.destination)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  })());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { title: 'AiWay', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'AiWay';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: data.icon || '/aiway-logo.png',
    badge: data.badge || '/aiway-logo.png',
    dir: 'auto',
    tag: data.tag || 'aiway-notification',
    renotify: Boolean(data.tag),
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(targetUrl);
        return client.focus();
      }
    }
    return clients.openWindow(targetUrl);
  }));
});
