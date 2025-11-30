// Versión del caché: súbela (v1, v2, v3...) cuando hagas cambios gordos
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `entrenos-cache-${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// INSTALACIÓN: precarga lo básico y toma control rápido
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVACIÓN: limpia cachés viejas y toma control de las pestañas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: 
// - para navegación (HTML): network-first (auto actualiza la app cuando hay versión nueva)
// - para estáticos: cache-first con actualización en segundo plano
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // navegación / HTML -> network first
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // otros recursos -> cache first + update en background
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // actualiza en segundo plano si hay red
        fetch(req).then(fresh => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
        }).catch(() => {});
        return cached;
      }
      // si no está en caché, tira de red y guarda
      return fetch(req).then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      });
    })
  );
});
