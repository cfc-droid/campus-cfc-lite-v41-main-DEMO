/* ==========================================================
   🟩 CFC_FIREBASE_DB — Inicializador único global
   ========================================================== */

console.log("🟡 [CFC_FIREBASE_INIT] Iniciando verificación...");

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
    authDomain: "cfc-lock-firebase.firebaseapp.com",
    projectId: "cfc-lock-firebase",
  };

  try {
    const app = firebase.initializeApp(firebaseConfig);
    window.CFC_FIREBASE_DB = firebase.firestore(app);

    console.log("🟢 [CFC_FIREBASE_INIT] Firebase inicializado correctamente — instancia global lista.");
  } catch (e) {
    console.error("❌ [CFC_FIREBASE_INIT] Error al inicializar Firebase:", e);
  }
} else {
  console.log("🔵 [CFC_FIREBASE_INIT] Firebase ya estaba inicializado — usando instancia existente.");
  window.CFC_FIREBASE_DB = firebase.firestore();
}
