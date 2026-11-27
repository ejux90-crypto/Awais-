// ECG Master Studio service worker (generated into sw.js by build.py; 716103425d is replaced).
// - App shell (index.html, manifest, icons): network-first, so a new version is picked up when online.
// - ECG images (ecgs/...): cache-first; cached the first time they are viewed, or all at once from
//   the in-app "Save for offline" button (which fetches offline.json and caches every listed file).
// - Anything else (e.g. litfl.com images not bundled): straight to the network.
const VERSION = '716103425d';
const SHELL = 'ecg-shell-' + VERSION;
const IMAGES = 'ecg-images-v1';  // kept across app updates: image file names are content-stable
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './offline.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith('ecg-shell-') && k !== SHELL).map((k) => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // litfl.com etc.: browser default
  if (url.pathname.includes('/ecgs/')) {
    e.respondWith(caches.open(IMAGES).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  // shell: network first, fall back to cache when offline
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(req, copy)); }
    return res;
  }).catch(async () => (await caches.match(req, { ignoreSearch: true })) ||
    (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
