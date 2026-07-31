// AiWay service worker — app-shell caching + Web Push notifications.
// Intentionally does NOT intercept /api/* requests: all chat, payment,
// Pi login and download traffic must always reach the network directly.
const CACHE_VERSION = 'aiway-shell-v4';
const SHELL_ASSETS = ['/', '/index.html', '/aiway-logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Documents are network-first so every Vercel deployment appears immediately.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.ok) caches.open(CACHE_VERSION).then(cache => cache.put('/index.html', response.clone())).catch(() => {});
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && request.destination === 'image') caches.open(CACHE_VERSION).then(cache => cache.put(request, response.clone())).catch(() => {});
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'AiWay', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'AiWay';
  const options = {
    body: data.body || '',
    icon: data.icon || '/aiway-logo.png',
    badge: data.badge || '/aiway-logo.png',
    dir: 'auto',
    tag: data.tag || 'aiway-notification',
    renotify: Boolean(data.tag),
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
