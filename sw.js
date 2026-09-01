/* PesanAja Service Worker — offline-first dengan cache versioning */
const CACHE_VERSION = 'pesanaja-v1';
const PRECACHE = [
  './',
  './index.html',
  './list-bisnis.html',
  './detail-bisnis.html',
  './profile.html',
  './orders.html',
  './order-detail.html',
  './login.html',
  './promo.html',
  './inbox.html',
  './bisnis.html',
  './tentang.html',
  './booking-flow.html',
  './404.html',
  './app-polish.css',
  './app-polish.js',
  './style.css',
  './app.css',
  './script.js',
  './app.js',
  './manifest.json',
  './assets/favicon.svg',
  './assets/logo.svg',
  './assets/logo.jpg',
  './assets/logo-full.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // addAll bisa gagal kalau salah satu URL 404 — gunakan add satu per satu agar tidak fatal
      return Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch(() => { /* abaikan resource yang missing */ })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Lewati request lintas-origin (fonts CDN, dll) — biarkan browser handle
  if (url.origin !== self.location.origin) return;

  // Strategi: untuk HTML pakai network-first (selalu coba update),
  // untuk asset lain pakai cache-first.
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('./404.html'))
        )
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
