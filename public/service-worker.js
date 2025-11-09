const CACHE = 'latin-quiz-v1';
const ASSETS = [
  '/quizlatino/',
  '/quizlatino/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => null)));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
