/* ==========================================================
   🔵 CFC_FIREBASE_INIT_V2 — Instancia Única Global Oficial
   ----------------------------------------------------------
   • Debe cargarse ANTES de:
       - cfc_lock_identity.js
       - cfc_lock_core.js
       - cfc_sync_reader.js
       - cfc_sync_writer.js
       - cfc_sync_remote.js
       - cfc_sync_boot.js
   • Evita reinicialización múltiple en:
       - index.html
       - modules/
       - páginas internas
   ========================================================== */

console.log("🔵 [CFC_FIREBASE_INIT] Iniciando verificación…");

(function () {
  try {

    // Si ya existe la instancia global → NO reinicializar
    if (window.CFC_FIREBASE_APP && window.CFC_FIREBASE_DB) {
      console.log("⚠️ [CFC_FIREBASE_INIT] Firebase ya estaba inicializado — usando instancia global existente.");
      return;
    }

    console.log("🔧 [CFC_FIREBASE_INIT] Creando instancia única de Firebase…");

    // Config global oficial (siempre igual para V41+)
    const firebaseConfig = {
      apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
      authDomain: "cfc-lock-firebase.firebaseapp.com",
      projectId: "cfc-lock-firebase"
    };

    // Inicializar Firebase App (única instancia)
    const app = firebase.initializeApp(firebaseConfig);

    // Inicializar Firestore asociado
    const db = firebase.firestore(app);

    // Exponer como variables globales protegidas
    window.CFC_FIREBASE_APP = app;
    window.CFC_FIREBASE_DB = db;

    console.log("🟢 [CFC_FIREBASE_INIT] Firebase inicializado correctamente — instancia global lista.");

  } catch (err) {

    console.error("❌ [CFC_FIREBASE_INIT] ERROR CRÍTICO al inicializar Firebase:", err);

    // Seguridad: impedir que Identity/Sync se rompan
    window.CFC_FIREBASE_APP = null;
    window.CFC_FIREBASE_DB = null;

  }
})();
