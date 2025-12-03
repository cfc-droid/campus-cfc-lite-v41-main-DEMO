// =======================================================
// 📦 CACHE.JS — MODO OFFLINE INTELIGENTE (CAMPUS CFC LITE V1.4)
// =======================================================

const CACHE_NAME = "cfc-cache-v1.5";
const RECURSOS_ESENCIALES = [
  "/frontend/index.html",
  "/frontend/css/premium.min.css",
  "/frontend/css/loader.css",
  "/frontend/js/loader.js",
  "/frontend/js/progress.js",
  "/frontend/js/menu.js",
  "/frontend/js/theme.js",
  "/frontend/fonts/Poppins-Regular.woff2",
  "/frontend/fonts/Poppins-Bold.woff2",

  // ================================
  // 🔹 MÓDULOS DEL CAMPUS (1 al 20)
  // ================================
  "/frontend/modules/1/index.html",
  "/frontend/modules/2/index.html",
  "/frontend/modules/3/index.html",
  "/frontend/modules/4/index.html",
  "/frontend/modules/5/index.html",
  "/frontend/modules/6/index.html",
  "/frontend/modules/7/index.html",
  "/frontend/modules/8/index.html",
  "/frontend/modules/9/index.html",
  "/frontend/modules/10/index.html",
  "/frontend/modules/11/index.html",
  "/frontend/modules/12/index.html",
  "/frontend/modules/13/index.html",
  "/frontend/modules/14/index.html",
  "/frontend/modules/15/index.html",
  "/frontend/modules/16/index.html",
  "/frontend/modules/17/index.html",
  "/frontend/modules/18/index.html",
  "/frontend/modules/19/index.html",
  "/frontend/modules/20/index.html"
];

// =======================================================
// 🧩 INSTALACIÓN DEL SERVICE WORKER
// =======================================================
self.addEventListener("install", event => {
  console.log("📥 Instalando Service Worker del Campus CFC...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("💾 Cacheando recursos esenciales...");
      return cache.addAll(RECURSOS_ESENCIALES);
    })
  );
  self.skipWaiting();
});

// =======================================================
// ⚙️ ACTIVACIÓN Y LIMPIEZA DE CACHE ANTIGUO
// =======================================================
self.addEventListener("activate", event => {
  console.log("✅ Service Worker activo y listo.");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("🧹 Eliminando cache antiguo:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// =======================================================
// 🌐 INTERCEPCIÓN DE PETICIONES (MODO OFFLINE)
// =======================================================
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log("⚡ Cargando desde cache:", event.request.url);
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          console.warn("🚫 Sin conexión, mostrando versión offline...");
          return caches.match("/frontend/index.html");
        });
    })
  );
});
