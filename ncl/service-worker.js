const CACHE_NAME = "aw139-checklist-v2.1-rev24-b46-swr";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/app.js",
  "./src/styles.css",
  "./src/data/checklist-data.js",
  "./src/checklist/storage.js",
  "./src/checklist/engine.js",
  "./assets/icon-192.svg",
  "./assets/icon-512.svg",
  "./assets/omni-logo.png",
  "../shared/pwa.css",
  "../shared/pwa.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith('aw139-checklist-') && key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate: responde do cache na hora (app instantâneo) e
// atualiza o cache em segundo plano — a versão nova chega na abertura
// seguinte.
self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async function () {
    var cached = await caches.match(request, { ignoreSearch: true });
    var refresh = fetch(request).then(function (fresh) {
      if (fresh && fresh.ok) {
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, fresh.clone()); });
      }
      return fresh;
    }).catch(function () { return null; });
    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }
    var fresh = await refresh;
    if (fresh) return fresh;
    if (request.mode === 'navigate') {
      var offline = await caches.match("./index.html", { ignoreSearch: true });
      if (offline) return offline;
    }
    return Response.error();
  })());
});
