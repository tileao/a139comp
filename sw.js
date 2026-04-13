const CACHE_NAME = 'aw139-companion-root-v3-premium';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './offline.html',
  './shared/home.js',
  './shared/pwa.js',
  './shared/module-bridge.js',
  './assets/icon.svg',
  './assets/icon-source.png',
  './assets/icon-32.png',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './cata/index.html',
  './cata/styles.css',
  './cata/app.js',
  './adc/index.html',
  './adc/app.js',
  './wat/index.html',
  './wat/styles.css',
  './wat/app.js',
  './wat/manifest.webmanifest',
  './rto/index.html',
  './rto/styles.css',
  './rto/app.js',
  './rto/manifest.webmanifest',
  './adc/base_pack_template_v3.json',
  './adc/base_pack_template_v4.json',
  './adc/base_pack_template_v5.json',
  './adc/sbcb_builtin_pack_v3.json',
  './adc/sbcb_builtin_pack_v4.json',
  './adc/sbcb_builtin_pack_v5.json',
  './adc/sbcb_chart_p1.png',
  './adc/sbcb_chart_p2.png',
  './adc/sbfs_builtin_pack_v3.json',
  './adc/sbfs_builtin_pack_v4.json',
  './adc/sbfs_builtin_pack_v5.json',
  './adc/sbfs_chart_p1.png',
  './adc/sbfs_chart_p2.png',
  './adc/sbgl_builtin_pack_v3.json',
  './adc/sbgl_builtin_pack_v4.json',
  './adc/sbgl_builtin_pack_v5.json',
  './adc/sbgl_chart_p1.png',
  './adc/sbgl_chart_p2.png',
  './adc/sbjr_builtin_pack_v3.json',
  './adc/sbjr_builtin_pack_v4.json',
  './adc/sbjr_builtin_pack_v5.json',
  './adc/sbjr_chart_p1.png',
  './adc/sbjr_chart_p2.png',
  './adc/sbme_builtin_pack_v3.json',
  './adc/sbme_builtin_pack_v4.json',
  './adc/sbme_builtin_pack_v5.json',
  './adc/sbme_chart_p1.png',
  './adc/sbme_chart_p2.png',
  './adc/sbmi_builtin_pack_v3.json',
  './adc/sbmi_builtin_pack_v4.json',
  './adc/sbmi_builtin_pack_v5.json',
  './adc/sbmi_chart_p1.png',
  './adc/sbmi_chart_p2.png',
  './adc/sbnf_builtin_pack_v3.json',
  './adc/sbnf_builtin_pack_v4.json',
  './adc/sbnf_builtin_pack_v5.json',
  './adc/sbnf_chart_p1.png',
  './adc/sbnf_chart_p2.png',
  './adc/sbrj_builtin_pack_v3.json',
  './adc/sbrj_builtin_pack_v4.json',
  './adc/sbrj_builtin_pack_v5.json',
  './adc/sbrj_chart_p1.png',
  './adc/sbrj_chart_p2.png',
  './adc/sbvt_builtin_pack_v3.json',
  './adc/sbvt_builtin_pack_v4.json',
  './adc/sbvt_builtin_pack_v5.json',
  './adc/sbvt_chart_p1.png',
  './adc/sbvt_chart_p2.png',
];
const RUNTIME_CACHE = 'aw139-companion-runtime-v3-premium';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => ![CACHE_NAME, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (error) {
        const cached = await caches.match(request);
        return cached || caches.match('./offline.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) {
      const cache = await caches.open(RUNTIME_CACHE);
      fetch(request).then((fresh) => {
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
      }).catch(() => {});
      return cached;
    }
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (error) {
      const fallback = await caches.match(request, { ignoreSearch: true });
      if (fallback) return fallback;
      throw error;
    }
  })());
});
