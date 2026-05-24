/* ============================================================
 * Clinical Reference - service worker
 * Cache-first offline strategy. Once installed, the whole app
 * is served from cache, so it works with zero network.
 * CACHE_VERSION is stamped by the GitHub Actions deploy workflow.
 * ============================================================ */
'use strict';

const CACHE_VERSION = '__BUILD_VERSION__';
const CACHE_NAME = 'clinical-reference-' + CACHE_VERSION;

const PRECACHE = [
  "./index.html",
  "./manifest.webmanifest",
  "./assets/fonts/fonts.css",
  "./assets/fonts/cormorant-garamond-latin-300-normal.woff2",
  "./assets/fonts/cormorant-garamond-latin-400-italic.woff2",
  "./assets/fonts/cormorant-garamond-latin-400-normal.woff2",
  "./assets/fonts/cormorant-garamond-latin-500-italic.woff2",
  "./assets/fonts/cormorant-garamond-latin-500-normal.woff2",
  "./assets/fonts/cormorant-garamond-latin-600-normal.woff2",
  "./assets/fonts/cormorant-garamond-latin-700-normal.woff2",
  "./assets/fonts/fraunces-latin-full-italic.woff2",
  "./assets/fonts/fraunces-latin-full-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-400-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-500-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-600-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-400-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-500-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-600-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-700-normal.woff2",
  "./assets/fonts/inter-latin-wght-normal.woff2",
  "./assets/fonts/inter-tight-latin-wght-normal.woff2",
  "./assets/fonts/jetbrains-mono-latin-wght-normal.woff2",
  "./assets/fonts/source-sans-3-latin-wght-normal.woff2",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-16.png",
  "./assets/icons/favicon-32.png",
  "./assets/icons/favicon.ico",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-192.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/icon.svg"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
