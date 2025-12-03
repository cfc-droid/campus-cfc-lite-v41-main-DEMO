/* ==========================================================
   🟩 CFC_FIREBASE_INIT — MSCU V41 (versión estable)
   Inicialización única, mínima y compatible con Identity/Core
   ========================================================== */

console.log("🟡 [CFC_FIREBASE_INIT] Verificando instancia...");

try {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
      authDomain: "cfc-lock-firebase.firebaseapp.com",
      projectId: "cfc-lock-firebase",
    });

    console.log("🟢 [CFC_FIREBASE_INIT] Firebase inicializado correctamente.");
  } else {
    console.log("🔵 [CFC_FIREBASE_INIT] Firebase ya estaba inicializado.");
  }
} catch (err) {
  console.error("❌ [CFC_FIREBASE_INIT] Error crítico:", err);
}
