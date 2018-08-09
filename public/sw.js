importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");
var CACHE_STATIC_NAME = "static-v1";
var CACHE_DYNAMIC_NAME = "dynamic-v1";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
];

// function trimCache(cacheName, maxItems) {
//   caches
//     .open(cacheName)
//     .then(cache => {
//       return cache.keys()
//         .then(keys => {
//         if(keys.length >maxItems){
//             cache.delete(keys[0])
//             .then(trimCache(cacheName,maxItems));
//         }
//       });
//     });
// }

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
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
  var url = "https://pwa-igor-course.firebaseio.com/posts.json";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(response => {
        var clonedRes = response.clone();
        clearAllData("posts").then(() => {
          clonedRes.json().then(data => {
            for (let key in data) {
              writeData("posts", data[key]);
            }
          });
        });
        return response;
      })
    );
  } else if (isInArray(STATIC_FILES, event.request.url)) {
    event.respondWith(caches.match(event.request.url));
  } else {
    event.respondWith(
      caches.match(event.request).then(resp => {
        if (resp) {
          return resp;
        } else {
          return fetch(event.request)
            .then(response => {
              return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                // trimCache(CACHE_DYNAMIC_NAME,3);
                cache.put(event.request.url, response.clone());
                return response;
              });
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME).then(cache => {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
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
