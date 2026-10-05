// Sanghyun High School Portal Service Worker
const CACHE_NAME = 'sanghyun-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching static assets failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL: Never intercept external/cross-origin requests (CDNs, Discord, external APIs).
  // Returning without calling event.respondWith() allows the browser to fetch natively,
  // preventing connect-src CSP violations and respondWith(undefined) network errors.
  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. Navigation requests: Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedDash = await caches.match('/dashboard');
        if (cachedDash) return cachedDash;
        const cachedRoot = await caches.match('/');
        if (cachedRoot) return cachedRoot;
        return new Response('인터넷 연결이 오프라인 상태입니다.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    return;
  }

  // 4. Local static assets: Cache-first for icons and next static bundles
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
            }
            return networkResponse;
          })
          .catch(async () => {
            // Guarantee a valid Response is returned, never undefined
            return new Response('', { status: 404, statusText: 'Not Found' });
          });
      })
    );
    return;
  }

  // 5. All other local requests: Let the browser handle normally
});
