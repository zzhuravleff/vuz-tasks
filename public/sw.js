// public/sw.js
import { version } from '../lib/version';

const CACHE_NAME = {version};
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Установка — кэшируем статические ассеты
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Активируем новый SW сразу
});

// Активация — чистим старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Захватываем все клиенты
});

// Fetch — сначала кэш, потом сеть (Cache First)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API запросы — Network First (свежие данные важнее)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // HTML страницы — Network First с fallback на кэш
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .catch(() => caches.match('/offline.html')) // офлайн-страница
    );
    return;
  }

  // Статика — Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});