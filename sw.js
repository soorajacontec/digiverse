/* Digiverse service worker
 * - App shell: the page itself is fetched network-first, so a new push to GitHub reaches
 *   installed apps on their next open; the cached copy is used when offline.
 * - Icons and static files: cache-first.
 * - Fonts and libraries (Google Fonts, jsDelivr): cache-first.
 * - Live data and images from other sites: network-first, last good copy when offline.
 * Bump VERSION when you change icons or other static files.
 */
const VERSION = "digiverse-v14";
const SHELL = [
  "./", "./index.html", "./offline.html", "./manifest.webmanifest",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png"
];
const STATIC_HOSTS = /(^|\.)fonts\.(googleapis|gstatic)\.com$|^cdn\.jsdelivr\.net$/;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.registration.navigationPreload ? self.registration.navigationPreload.enable() : null)
      .then(() => self.clients.claim())
  );
});

const putIn = (name, req, res) => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(name).then(c => c.put(req, copy)); } return res; };

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Opening the app: newest version when online, cached page offline
  if (req.mode === "navigate") {
    const isApp = url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname);
    const key = isApp ? "./index.html" : req;
    e.respondWith((async () => {
      try {
        const pre = await e.preloadResponse; if (pre) return putIn(VERSION, key, pre);
        return putIn(VERSION, key, await fetch(req));
      } catch {
        return (await caches.match("./index.html")) || (await caches.match("./offline.html"));
      }
    })());
    return;
  }
  // Fonts and libraries never change
  if (STATIC_HOSTS.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => putIn(VERSION + "-static", req, res))));
    return;
  }
  // Live data services and live images
  if (url.origin !== location.origin) {
    e.respondWith(fetch(req).then(res => putIn(VERSION + "-data", req, res)).catch(() => caches.match(req)));
    return;
  }
  // Our own static files: cache first, refresh in the background
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => putIn(VERSION, req, res)).catch(() => hit);
    return hit || net;
  }));
});

// Trim the live-data cache now and then so it doesn't grow forever
self.addEventListener("message", e => {
  if (e.data === "trim") caches.open(VERSION + "-data").then(c => c.keys().then(keys => keys.slice(0, Math.max(0, keys.length - 300)).forEach(k => c.delete(k))));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data && e.notification.data.url;
  e.waitUntil(url ? clients.openWindow(url) : clients.matchAll({ type: "window" }).then(w => w[0] ? w[0].focus() : clients.openWindow("./")));
});
