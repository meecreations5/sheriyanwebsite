/* SHANERYN public PWA: intentionally minimal/offline-safe caching.
   Never cache CMS/admin, API, requests, personal form submissions or dynamic
   collection HTML. Catalogue content always comes from the live server. */
const CACHE = 'shaneryn-offline-v120';
const PRELOAD = ['/offline.html','/pwa/icon-192.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRELOAD)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shaneryn-offline-')&&k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim(),
  ]));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET'||request.mode!=='navigate') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||/^\/(?:admin|api|_next)(?:\/|$)/.test(url.pathname)) return;
  event.respondWith(fetch(request).catch(()=>caches.match('/offline.html').then(fallback=>fallback||new Response('You are offline. Reconnect to explore SHANERYN.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
