// Service worker — offline caching for the static app.
// Strategy:
//   * On install: pre-cache all known shell + data assets.
//   * On fetch: cache-first, falling back to network. If network adds something
//     new on a subsequent visit, the next install of a new service worker will
//     refresh the cache.
//
// Bump CACHE_VERSION whenever a release ships, so old caches get evicted on
// the next visit.
const CACHE_VERSION = 'jlpt-n5-tutor-v2';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './README.md',
  './TASKS.md',
  './css/main.css',
  './js/app.js',
  './js/storage.js',
  './js/furigana.js',
  './js/learn.js',
  './js/test.js',
  './js/review.js',
  './js/summary.js',
  './js/drill.js',
  './js/diagnostic.js',
  './js/settings.js',
  './data/grammar.json',
  './data/questions.json',
  './data/n5_kanji_whitelist.json',
  './data/n5_kanji_readings.json',
  './data/n5_vocab_whitelist.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Cache each asset; if any single one fails (e.g. file rename), the whole
    // install fails. Use addAll for atomicity. If you want partial-tolerance,
    // switch to a per-asset try/catch.
    try {
      await cache.addAll(PRECACHE);
    } catch (err) {
      console.warn('Service worker precache failed:', err);
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  // Only handle GETs; let everything else go to the network.
  if (event.request.method !== 'GET') return;
  // Same-origin only — don't intercept third-party requests.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      // Cache successful same-origin responses for next time.
      if (fresh.ok) {
        cache.put(event.request, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (err) {
      // Offline AND not in cache. Fall through to a generic 503.
      return new Response('Offline and not cached.', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});
