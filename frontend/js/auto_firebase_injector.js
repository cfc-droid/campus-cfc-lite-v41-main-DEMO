/* ==========================================================
   ✅ CFC_FUNC_12_V41_FINAL — Auto Firebase Injector (PRUEBA 12)
   Forzar carga real de firebase_init.js en módulos/capítulos
   Creado: 03/12/2025 — 03:41 hs
   Autor: CFC-DROID
========================================================== */

(function () {
  console.log("🔥 [PR12] AutoFirebaseInjector — INICIO");

  // Ruta real del init global
  const FIREBASE_INIT_PATH = "../js/core/firebase_init.js";

  // Verificar si Firebase YA está cargado
  const isFirebaseLoaded =
    window.firebase &&
    window.firebase?.apps &&
    window.firebase?.apps.length > 0;

  console.log("🔥 [PR12] ¿Firebase ya cargado?:", isFirebaseLoaded);
  console.log("🔥 [PR12] firebase.apps:", window.firebase?.apps);

  if (isFirebaseLoaded) {
    console.log("🔥 [PR12] Firebase YA ESTÁ cargado — NO se inyecta de nuevo.");
    return;
  }

  console.warn("⚠️ [PR12] Firebase NO está cargado — INYECTANDO firebase_init.js…");

  // Crear <script> dinámico
  const script = document.createElement("script");
  script.src = FIREBASE_INIT_PATH + "?pr12=" + Date.now();
  script.async = false; // Importante: evitar ejecución fuera de orden

  script.onload = () => {
    console.log("🔥 [PR12] firebase_init.js EJECUTADO correctamente.");
    console.log("🔥 [PR12] firebase.apps:", window.firebase?.apps);
  };

  script.onerror = () => {
    console.error("❌ [PR12] ERROR CRÍTICO: No pudo cargarse firebase_init.js");
  };

  // Inyectar SIEMPRE en <head>
  document.head.appendChild(script);

})();
