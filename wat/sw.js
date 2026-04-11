const CACHE_NAME = 'aw139-wat-companion-v16-9-9-fullscreen-hires';
const APP_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './app.js?v=v16_9_9-wat-fullscreen-hires',
  './manifest.webmanifest',
  './README.md',
  './data/chart-schema.json',
  './data/clear-standard-exact.json',
  './data/clear-eapsoff-exact.json',
  './data/clear-eapson-exact.json',
  './data/confined-eapson-exact.json',
  './data/eaps-off-exact.json',
  './data/ibf-installed-exact.json',
  './data/ibf-cleararea-exact.json',
  './data/ibf-confined-exact.json',
  './data/confined-standard-exact.json',
  './data/confined-eapsoff-exact.json',
  './assets/offshore_standard_chart_clip.png',
  './docs/WAC charts 6800.pdf',
  './docs/page-01.png',
  './docs/page-02.png',
  './docs/page-03.png',
  './docs/page-06.png',
  './docs/page-07.png',
  './docs/page-08.png',
  './docs/page-09.png',
  './docs/page-10.png',
  './docs/page-11.png',
  './docs/page-04.png',
  './docs/page-05.png',
  './docs/page-12.png',

  './data/confined-standard-6400-exact.json',
  './data/confined-eapsoff-6400-exact.json',
  './data/confined-eapson-6400-exact.json',
  './data/confined-ibf-6400-exact.json',
  './docs/Confined 6400 charts.pdf',
  './docs/page-13.png',
  './docs/page-14.png',
  './docs/page-15.png',
  './docs/page-16.png',
  './docs/page-17.png',
  './docs/wat7000.pdf',
  './docs/page-18.png',
  './docs/page-19.png',
  './docs/page-20.png',
  './docs/page-21.png',
  './docs/page-22.png',
  './docs/page-23.png',
  './docs/page-24.png',
  './docs/page-25.png',
  './docs/WAT enhanced.pdf',
  './docs/page-26.png',
  './docs/page-27.png',
  './docs/page-28.png',
  './docs/page-29.png',
  './docs/page-30.png',
  './docs/page-31.png',
  './docs/page-32.png',
  './docs/page-33.png',
  './data/sup90-cleararea-stageA.json',
  './data/sup90-clear-standard-exact.json',
  './data/sup90-clear-eapsoff-exact.json',
  './data/sup90-clear-eapson-exact.json',
  './data/sup90-clear-ibf-exact.json',
  './data/sup90-cleararea-stageB.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
