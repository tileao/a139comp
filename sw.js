const CACHE_NAME = 'aw139-companion-root-v48-strip-autorefresh';

// Precache mínimo: só o shell dos módulos servidos pelo SW da raiz.
// WAT, RTO, Pesos, SLO, NCL e Importar Voo têm service workers próprios
// com escopo nas suas pastas — pré-cachear o conteúdo deles aqui duplicava
// dezenas de MB e re-baixava tudo a cada bump de versão. Assets pesados
// (cartas ADC, PDFs, páginas do RFM, pdf.js do Importar Voo) entram no
// cache em runtime, no primeiro uso, pelo SW próprio de cada módulo.
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-32.png",
  "./assets/icon-512.png",
  "./assets/icon.svg",
  "./cata/app.js",
  "./cata/index.html",
  "./cata/styles.css",
  "./adc/app.js",
  "./adc/index.html",
  "./pouso-offshore/index.html",
  "./pouso-offshore/app.js",
  "./pouso-offshore/styles.css",
  "./decolagem-offshore/index.html",
  "./decolagem-offshore/app.js",
  "./decolagem-offshore/styles.css",
  "./flight-preview/index.html",
  "./flight-preview/app.js",
  "./flight-preview/styles.css",
  "./dropdown/index.html",
  "./dropdown/app.js",
  "./dropdown/styles.css",
  "./dropdown/graphData.js",
  "./dropdown/ddv7-patch.js",
  "./dropdown/ddv7-fullscreen-fix.js",
  "./dropdown/assets/dropdown-enhanced-7000.png",
  "./dropdown/assets/dropdown-offshore-6400.png",
  "./dropdown/assets/dropdown-offshore-6800.png",
  "./shared/home.js",
  "./shared/module-bridge.js",
  "./shared/module-layout.css",
  "./shared/offshore-calc.js",
  "./shared/pwa.css",
  "./shared/pwa.js"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('aw139-companion-root-') && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Stale-while-revalidate: responde do cache na hora (app instantâneo) e
// atualiza o cache em segundo plano — a versão nova chega na abertura
// seguinte (o pwa.js recarrega sozinho quando o SW novo assume).
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    const refresh = fetch(request).then((fresh) => {
      if (fresh && fresh.ok) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, fresh.clone()));
      }
      return fresh;
    }).catch(() => null);
    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }
    const fresh = await refresh;
    if (fresh) return fresh;
    if (request.mode === 'navigate') {
      const offline = await caches.match('./offline.html', { ignoreSearch: true });
      if (offline) return offline;
    }
    return Response.error();
  })());
});
