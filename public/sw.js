var CACHE_STATIC_NAME = "static-v9";
var CACHE_DYNAMIC_NAME = "dynamic-v1";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
];

function isInArray(string,array){
  for(let element in array){
    if(element === string){
      return true;
    }
  }
  return false;
}

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log("[SW] precaching app shell");
      cache.addAll(STATIC_FILES);
    })
  );
});
self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[SW] removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

//cache then network
self.addEventListener("fetch", function(event) {
  var url = "https://httpbin.org/get";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
    );
  } else if(isInArray(STATIC_FILES,event.request.url)){
    event.respondWith(caches.match(event.request.url));
  }else {
    event.respondWith(
      caches.match(event.request).then(resp => {
        if (resp) {
          return resp;
        } else {
          return fetch(event.request)
            .then(response => {
              return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                cache.put(event.request.url, response.clone());
                return response;
              });
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME).then(cache => {
                if(event.request.url.indexOf('/help')){
                  return cache.match("/offline.html");
                }

              });
              //return caches.match("/offline.html");
            });
        }
      })
    );
  }
});

// network with cache fallback
/* self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).then(response => {
      return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
        cache.put(event.request.url, response.clone());
        return response;
      });
    }).catch(error => {
      return caches.match(event.request);
    })
  );
}); */

// cache with network  fallback
/* self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) {
        return resp;
      } else {
        return fetch(event.request)
          .then(response => {
            return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          })
          .catch(err => {
            return caches
              .open(CACHE_STATIC_NAME)
              .then(cache => cache.match("/offline.html"));
              //return caches.match("/offline.html");
          });
      }
    })
  );
}); */
