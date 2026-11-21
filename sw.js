/* seku seku service worker.
   1. Every update reaches phones without a hard refresh: the app's own files are always fetched
      fresh from the network (the browser checks with the server instead of using its 10-minute cache).
   2. If the phone is offline, the last copy is shown so the app still opens.
   Other sites (Supabase, fonts, book lookups) are not touched. */
const CACHE = 'seku-shell-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'i18n.js', 'data.js', 'terms.js', 'privacy.js', 'config.js', 'backend.js',
  'manifest.json', 'brand/icons/favicon.svg', 'vendor/fonts/outfit.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'no-cache' })))).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    // fetch by URL: a navigation request can't be copied with new options
    fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
