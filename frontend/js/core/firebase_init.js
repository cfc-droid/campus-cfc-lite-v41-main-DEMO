/* ==========================================================
   🔵 CFC_FIREBASE_INIT_V1 — Instancia única global
   Debe cargarse ANTES de identity.js y core.js
   ========================================================== */

console.log("🔵 CFC_FIREBASE_INIT cargando…");

(function () {

  try {

    // Evitar reinicialización múltiple
    if (!window.CFC_FIREBASE_APP) {

      const firebaseConfig = {
        apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
        authDomain: "cfc-lock-firebase.firebaseapp.com",
        projectId: "cfc-lock-firebase",
      };

      // Inicializar Firebase App
      const app = firebase.initializeApp(firebaseConfig);

      // Inicializar Firestore
      const db = firebase.firestore(app);

      // Exponer globalmente
      window.CFC_FIREBASE_APP = app;
      window.CFC_FIREBASE_DB = db;

      console.log("🟢 CFC_FIREBASE_INIT completado — instancia global lista");
    }

  } catch (err) {
    console.error("❌ Error inicializando Firebase GLOBAL:", err);
  }

})();
