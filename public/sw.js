/* Minimal offline fallback; never cache event photos, API responses, auth or admin screens. */
const CACHE="sabor-com-amor-pwa-shell-v1";
const OFFLINE="/offline.html";
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([OFFLINE,"/default-favicon.svg"])));
 self.skipWaiting();
});
self.addEventListener("activate",event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(names=>Promise.all(names.filter(name=>name.startsWith("sabor-com-amor-pwa-")&&name!==CACHE).map(name=>caches.delete(name)))),
  self.clients.claim()
 ]));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||request.mode!=="navigate")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.startsWith("/admin")||url.pathname.startsWith("/api"))return;
 event.respondWith(fetch(request).catch(async()=>await caches.match(OFFLINE)||Response.error()));
});
