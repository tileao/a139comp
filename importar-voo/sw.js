'use strict';

// Bump a versão a cada release para invalidar caches antigos.
var CACHE_NAME = 'aw139-importar-voo-v3';
var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './parser.js',
  './text-parser.js',
  './manifest.webmanifest',
  './vendor/pdf.min.mjs',
  './vendor/pdf.worker.min.mjs',
  '../assets/icon-192.png',
  '../assets/icon-512.png',
  '../shared/pwa.css',
  '../shared/pwa.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      // Só caches do PRÓPRIO módulo: o Cache Storage é compartilhado por
      // todo o origin — apagar os demais nukearia os outros módulos.
      return Promise.all(keys.filter(function (k) { return k.indexOf('aw139-importar-voo-') === 0 && k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
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
      var offline = await caches.match('./index.html', { ignoreSearch: true });
      if (offline) return offline;
    }
    return Response.error();
  })());
});
