var staticCacheID = "mws-restaurant-001";

var urlsToCache = [
  "/",
  "/index.html",
  "/restaurant.html",
  "/css/styles.css",
  "/css/between600to899.css",
  "/css/below799.css",
  "/css/below449.css",
  "/css/above900.css",
  "/css/above800.css",
  "/img",
  "/js/",
  "/js/dbhelper.js",
  "/js/main.js",
  "/js/register.js",
  "/js/restaurant_info.js",
  "/data/restaurants.json"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheID).then(cache => {
      return cache
        .addAll(urlsToCache)
        .catch(error => {
          console.log("Caches open failed: " + error);
        });
    })
  );
});

/** Deletes old cache when a new one is available */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('mws-') &&
          cacheName != staticCacheID;
        }).map(cacheName => {
          return cache.delete(cacheName);
        })
      )
    })
  );
});

self.addEventListener("fetch", event => {
  /** Saves the event request */
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }
  if (cacheUrlObj.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }

  event.respondWith(
    caches.match(cacheRequest).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchResponse => {
            return caches.open(staticCacheID).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch(error => {
            if (event.request.url.indexOf(".jpg") > -1) {
              return caches.match("/img/na.png");
            }
            return new Response("Application is not connected to the internet.", {
              status: 404,
              statusText: "Application is not connected to the internet"
            });
          })
      );
    })
  );
});
