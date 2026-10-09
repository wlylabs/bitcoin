// Offline support: pages and data are fetched network-first and cached, so any
// page you have visited still opens offline. Hashed build assets are immutable
// and served cache-first. Bump VERSION to drop old caches on the next visit.
const VERSION = "v2";
const CACHE = `btc-history-${VERSION}`;
const PRECACHE = [
  "/en", "/id",
  "/en/history", "/id/history",
  "/en/play", "/id/play",
  "/en/cryptography", "/id/cryptography",
  "/en/memecoins", "/id/memecoins",
  "/en/lab", "/id/lab",
  "/icons/bitcoin.svg", "/icons/icon-192.png", "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(request)
          .then((hit) => hit || (request.mode === "navigate" ? caches.match(url.pathname.startsWith("/id") ? "/id" : "/en") : undefined))
          .then((res) => res || Response.error())
      )
  );
});
