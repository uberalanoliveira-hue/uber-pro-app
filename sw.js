const APP_VERSION = 'v20.9';
const STATIC_CACHE = 'metadriver-static-' + APP_VERSION;
const RUNTIME_CACHE = 'metadriver-runtime-' + APP_VERSION;
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './app30_app.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './reset.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
        return caches.delete(key);
      }
      return Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        const runtime = await caches.open(RUNTIME_CACHE);
        runtime.put(request, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(request);
        return cached || caches.match('./app30_app.html') || caches.match('./index.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      const runtime = await caches.open(RUNTIME_CACHE);
      runtime.put(request, fresh.clone());
      return fresh;
    } catch (err) {
      return caches.match(request);
    }
  })());
});
