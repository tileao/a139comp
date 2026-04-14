const CACHE_NAME = 'aw139-rto-offline-v1-fullcache';
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
  "./data/figure_4_54_engine_data.json",
  "./data/figure_4_54_vector_geometry.json",
  "./data/figure_4_54_vector_linework.json",
  "./data/figure_4_56_engine_data.json",
  "./data/figure_4_58_engine_data.json",
  "./data/figure_4_68a_engine_data.json",
  "./data/figure_4_92_engine_data.json",
  "./data/figure_4_94_engine_data.json",
  "./data/figure_4_94_reference.json",
  "./data/figure_4_96_engine_data.json",
  "./data/figure_4_96_reference.json",
  "./data/figure_4_98_engine_data.json",
  "./data/figure_4_98_reference.json",
  "./docs/figure_4_58_center_right_corrected_reference_v17.png",
  "./docs/figure_4_58_left_semantic_corrected_v15.png",
  "./docs/figure_4_94_combined_fresh_v46.png",
  "./docs/figure_4_94_semantic_fresh_v46.png",
  "./docs/figure_4_94_vector_only_fresh_v46.png",
  "./docs/figure_4_96_combined_fresh_v54.png",
  "./docs/figure_4_96_semantic_audit_sheet_v56.png",
  "./docs/figure_4_96_semantic_fresh_v54.png",
  "./docs/figure_4_96_vector_precise_v55.png",
  "./docs/figure_4_98_center_semantic_audit_v62.png",
  "./docs/figure_4_98_left_semantic_audit_v62.png",
  "./docs/figure_4_98_right_semantic_audit_v62.png",
  "./docs/figure_4_98_semantic_audit_sheet_v62.png",
  "./docs/figure_4_98_vector_exact_v62.png",
  "./docs/page_s50_108a_figure_4_68a.png",
  "./docs/page_s50_85_figure_4_54.png",
  "./docs/page_s50_89_figure_4_56.png",
  "./docs/page_s50_93_figure_4_58.png",
  "./docs/page_s90_123_figure_4_92.png",
  "./docs/page_s90_127_figure_4_94.png",
  "./docs/page_s90_131_figure_4_96.png",
  "./docs/page_s90_135_figure_4_98.png",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css",
  "./sw.js"
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
