'use strict';

// Service worker do módulo Importar Voo — cache IMUTÁVEL por versão.
//
// Bump BUILD a cada release em que qualquer arquivo do módulo muda. O mesmo
// número tem que ser espelhado em app.js (IMPORTAR_BUILD) e no
// data-importar-build do <body> em index.html — é assim que a guarda de
// versão em runtime detecta e se recupera de um "skew" de cache.
var BUILD = '9';
var CACHE_NAME = 'aw139-importar-voo-v' + BUILD;

var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './text-parser.js',
  './manifest.webmanifest',
  '../assets/icon-192.png',
  '../assets/icon-512.png',
  '../shared/pwa.css',
  '../shared/pwa.js'
];

// Install: pré-cacheia TODOS os arquivos do módulo numa cache versionada,
// de forma ATÔMICA. Se qualquer arquivo falhar (404 num deploy quebrado),
// o addAll rejeita, o install falha e o SW anterior continua servindo a
// versão anterior intacta — nunca uma versão pela metade.
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

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Cache-first IMUTÁVEL. A causa raiz dos travamentos por "skew" (index.html
// de uma geração servido junto de um app.js de outra) era o padrão anterior
// (stale-while-revalidate) regravar cada arquivo baixado de volta na cache
// versionada durante o fetch: os arquivos passavam a derivar de forma
// independente, por timing de rede, sem nenhum bump de versão.
//
// Aqui NUNCA regravamos a cache versionada no fetch. Todo arquivo servido
// numa sessão vem da MESMA geração (a que o install pré-cacheou). A única
// forma de trocar de versão é um SW novo (BUILD novo) instalar e ativar,
// trocando todos os arquivos de uma vez só — atômico e sem mistura.
self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async function () {
    var cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Não estava no precache (algo pedido só em runtime): busca da rede,
    // mas NÃO grava na cache versionada — gravar reintroduziria o skew.
    try {
      return await fetch(request);
    } catch (e) {
      if (request.mode === 'navigate') {
        var shell = await caches.match('./index.html', { ignoreSearch: true });
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
