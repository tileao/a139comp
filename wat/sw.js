const CACHE_NAME = 'aw139-wat-offline-v2-responsive';
const ASSETS = [
  "./",
  "../assets/icon-180.png",
  "../assets/icon-192.png",
  "../assets/icon-32.png",
  "../assets/icon-512.png",
  "../assets/icon-source.png",
  "../assets/icon.svg",
  "../offline.html",
  "../shared/module-bridge.js",
  "../shared/module-layout.css",
  "../shared/pwa.css",
  "../shared/pwa.js",
  "./README.md",
  "./app.js",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-32.png",
  "./assets/icon-512.png",
  "./assets/icon-source.png",
  "./assets/icon.svg",
  "./assets/offshore_standard_chart_clip.png",
  "./data/chart-schema.json",
  "./data/clear-eapsoff-exact.json",
  "./data/clear-eapson-exact.json",
  "./data/clear-standard-exact.json",
  "./data/confined-eapsoff-6400-exact.json",
  "./data/confined-eapsoff-exact.json",
  "./data/confined-eapson-6400-exact.json",
  "./data/confined-eapson-exact.json",
  "./data/confined-ibf-6400-exact.json",
  "./data/confined-standard-6400-exact.json",
  "./data/confined-standard-exact.json",
  "./data/eaps-off-exact.json",
  "./data/ibf-cleararea-exact.json",
  "./data/ibf-confined-exact.json",
  "./data/ibf-installed-exact.json",
  "./data/sup90-clear-eapsoff-exact.json",
  "./data/sup90-clear-eapson-exact.json",
  "./data/sup90-clear-ibf-exact.json",
  "./data/sup90-clear-standard-exact.json",
  "./data/sup90-cleararea-stageA.json",
  "./data/sup90-cleararea-stageB.json",
  "./docs/Confined 6400 charts.pdf",
  "./docs/WAC charts 6800.pdf",
  "./docs/WAT enhanced.pdf",
  "./docs/page-01.png",
  "./docs/page-02.png",
  "./docs/page-03.png",
  "./docs/page-04.png",
  "./docs/page-05.png",
  "./docs/page-06.png",
  "./docs/page-07.png",
  "./docs/page-08.png",
  "./docs/page-09.png",
  "./docs/page-10.png",
  "./docs/page-11.png",
  "./docs/page-12.png",
  "./docs/page-13.png",
  "./docs/page-14.png",
  "./docs/page-15.png",
  "./docs/page-16.png",
  "./docs/page-17.png",
  "./docs/page-18.png",
  "./docs/page-19.png",
  "./docs/page-20.png",
  "./docs/page-21.png",
  "./docs/page-22.png",
  "./docs/page-23.png",
  "./docs/page-24.png",
  "./docs/page-25.png",
  "./docs/page-26.png",
  "./docs/page-27.png",
  "./docs/page-28.png",
  "./docs/page-29.png",
  "./docs/page-30.png",
  "./docs/page-31.png",
  "./docs/page-32.png",
  "./docs/page-33.png",
  "./docs/wat7000.pdf",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css",
  "./sw.js",
  "./test_overlay_case.png"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
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

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (error) {
      if (request.mode === 'navigate') {
        const offline = await caches.match('./index.html', { ignoreSearch: true }) || await caches.match('../offline.html', { ignoreSearch: true });
        if (offline) return offline;
      }
      throw error;
    }
  })());
});
