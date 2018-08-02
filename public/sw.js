self.addEventListener("install", event => {
  console.log("[SW] installing", event);
});
self.addEventListener("activate", event => {
  console.log("[SW] activating", event);
  return self.clients.claim();
});
self.addEventListener("fetch", event => {
  console.log("[SW] fetching something", event);
  event.respondWith(fetch(event.request));
});
