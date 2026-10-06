const CACHE_NAME = 'gramvyapar-shell-v5';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './signup.html',
  './dashboard.html',
  './app.webmanifest',
  './app-icon-192.png',
  './app-icon-512.png',
  './app-icon.svg',
  './reference-style.css',
  './hover.css',
  './auth-feedback.css',
  './style.css',
  './dashboard.css',
  './dashboard-controls.css',
  './language.js',
  './demo-api.js',
  './pwa.js',
  './auth.js',
  './script.js',
  './dashboard.js',
  './reference-assets/artisan-pottery.png',
  './reference-assets/artisan-crochet.png',
  './reference-assets/artisan-knitting.png',
  './reference-assets/artisan-bamboo.png',
  './reference-assets/artisan-tailoring.png',
  './reference-assets/artisan-beauty.png',
  './reference-assets/artisan-food-processing.png',
  './reference-assets/shop-blue-pottery.jpg',
  './reference-assets/shop-handwoven-stole.jpg',
  './reference-assets/shop-terracotta-lamp.jpg',
  './reference-assets/shop-bamboo-basket.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('gramvyapar-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cachedPage = await caches.match(request, { ignoreSearch: true });
        if (cachedPage) return cachedPage;
        const offlineHome = await caches.match('./index.html');
        if (offlineHome) return offlineHome;
        throw error;
      }
    })());
    return;
  }

  if (/\.(?:js|css|webmanifest)$/.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
