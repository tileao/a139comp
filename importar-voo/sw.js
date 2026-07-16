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
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first com fallback ao cache: atualizações publicadas aparecem no
// próximo carregamento com rede; offline continua funcionando pelo cache
// (essencial aqui — o pdf.js vendorizado precisa abrir sem rede).
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
