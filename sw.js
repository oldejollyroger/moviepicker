const CACHE_NAME = 'moviepicker-v3'; // Changed version to force an update
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/config.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  '/screenshot-desktop.png', // Added the new screenshot
  '/screenshot-mobile.png'  // Added the new screenshot
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('Fetch failed; returning offline page from cache.');
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/');
          return cachedResponse;
        }
      })()
    );
  }
});