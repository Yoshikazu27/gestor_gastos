const CACHE_NAME = "gastos-app-v1";

const urlsToCache = [
  "/gestor_gastos/",
  "/gestor_gastos/index.html",
  "/gestor_gastos/script.js",
  "/gestor_gastos/styles.css",
  "/gestor_gastos/manifest.json",
  "/gestor_gastos/icon-192.png",
  "/gestor_gastos/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.error("No se pudo cachear:", url);
        }
      }
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});