// Versión del caché: súbela cuando cambies cosas gordas
const CACHE_VERSION = "v1.1.0";
const CACHE_NAME = `entrenos-cache-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALACIÓN: precarga assets básicos
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVACIÓN: borra cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// FETCH:
// - Navegación/HTML: network-first para auto-actualizar.
// - Estáticos: cache-first con actualización en background.
self.addEventListener("fetch", event => {
  const req = event.request;

  // Navegación → network-first
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Otros recursos → cache-first + update en segundo plano
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // actualiza en background
        fetch(req)
          .then(fresh => {
            caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
          })
          .catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return res;
      });
    })
  );
});
