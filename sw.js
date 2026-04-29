// Service worker - offline caching for the static app.
// Strategy (Brief 2 §12.1):
//   * On install: pre-cache the shell.
//   * Shell (HTML / CSS / JS): stale-while-revalidate. Serve cache instantly,
//     refresh in the background; post a message to clients when a new shell
//     is fetched so the page can show "Update available - reload?" toast.
//   * Content (data/audio/locales/manifest): cache-first.
//
// Bump CACHE_VERSION whenever a release ships, so old caches get evicted on
// the next visit.
const CACHE_VERSION = 'jlpt-n5-tutor-v19';

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
  './js/normalize.js',
  './js/kosoado.js',
  './js/wa-vs-ga.js',
  './js/verb-class.js',
  './js/te-form.js',
  './js/i18n.js',
  './js/particle-pairs.js',
  './js/counters.js',
  './js/reading.js',
  './js/listening.js',
  './js/kanji.js',
  './js/kanji-popover.js',
  './js/shortcuts.js',
  './js/search.js',
  './js/home.js',
  './js/pwa.js',
  './CHANGELOG.md',
  './data/vocab.json',
  './data/kanji.json',
  './data/reading.json',
  './data/listening.json',
  './data/audio_manifest.json',
  './locales/en.json',
  './locales/vi.json',
  './locales/id.json',
  './locales/ne.json',
  './locales/zh.json',
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

function isShellRequest(url) {
  // The shell = HTML, CSS, JS modules. Treat these stale-while-revalidate
  // so users always get instant navigation but a background fetch picks up
  // newly-deployed code.
  return /\.(html|css|js)$/.test(url.pathname) || url.pathname.endsWith('/');
}

async function broadcastUpdate() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'SW_UPDATE_AVAILABLE' });
  }
}

self.addEventListener('fetch', (event) => {
  // Only handle GETs; let everything else go to the network.
  if (event.request.method !== 'GET') return;
  // Same-origin only - don't intercept third-party requests.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isShellRequest(url)) {
    // stale-while-revalidate
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then(async (fresh) => {
        if (fresh && fresh.ok) {
          // Compare body length as a cheap "did it change?" signal.
          if (cached) {
            const oldLen = cached.headers.get('content-length');
            const newLen = fresh.headers.get('content-length');
            if (oldLen && newLen && oldLen !== newLen) {
              broadcastUpdate();
            }
          }
          cache.put(event.request, fresh.clone()).catch(() => {});
        }
        return fresh;
      }).catch(() => null);
      return cached || (await fetchPromise) || new Response('Offline and not cached.', { status: 503 });
    })());
    return;
  }

  // Content: cache-first.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      if (fresh.ok) cache.put(event.request, fresh.clone()).catch(() => {});
      return fresh;
    } catch {
      return new Response('Offline and not cached.', {
        status: 503, statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});

// Allow the page to ask the active SW to skip-wait when the user accepts the
// "Update available" toast.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
