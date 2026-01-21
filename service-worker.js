
const CACHE_NAME = 'ball-tower-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/js/config.js',
  '/js/game.js',
  '/js/menu.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});