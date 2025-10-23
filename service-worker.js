const CACHE = 'water-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cacheRes =>
      cacheRes ||
      fetch(req).then(netRes => {
        // cache only GET & same-origin
        if (req.method === 'GET' && new URL(req.url).origin === location.origin) {
          const clone = netRes.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return netRes;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
