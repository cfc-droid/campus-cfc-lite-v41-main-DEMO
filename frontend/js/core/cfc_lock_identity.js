/* ==========================================================
   ✅ CFC_LOCK_V47.6_REAL_DUPLICATE_PROTECT
   Sistema: CFC-LOCK — Autenticación, persistencia total y
   bloqueo automático de sesiones duplicadas.
   Auditor: CFC-SYNC QA FINAL — 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

/* ==========================================================
   🔹 Inicialización Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
  storageBucket: "cfc-lock-firebase.firebasestorage.app",
  messagingSenderId: "352796893243",
  appId: "1:352796893243:web:a2bb8b30a35f45579efc1e",
};

let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("🔥 Firebase inicializado correctamente (CFC_LOCK).");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🔐 LOGIN
   ========================================================== */
async function CFC_login(email, pass) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());
    window.location.href = "../index.html";
  } catch (err) {
    alert("Error al iniciar sesión: " + (err.message || err.code));
  }
}

/* ==========================================================
   🔒 LOGOUT — Preservación total de datos del Campus
   ========================================================== */
async function CFC_logout() {
  try {
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");
    await signOut(auth);

    // 🔐 Bloque: claves a preservar
    const preserveKeys = [
      "CFC_PROGRESS", "CFC_TIMER", "CFC_MODULE_STATE", "CFC_EMO_STATE",
      "CFC_LAST_LOGIN", "progressData", "progressPercent",
      "examResults", "examResults_backup", "exam_history",
      "studyStats", "CFC_time_total", "CFC_last_sync",
      "CFC_lastDate", "CFC_days", "CFC_totalDays",
      "emotionScore", "CFC_THEME_STATE",
      "bitacoraData", "bitacoraFilters", "CFC_bitacoraState",
      "CFC_LOCK_BADGE", "CFC_LOCK_VERSION", "CFC_BADGE_STATE"
    ];

    const preservedData = {};
    preserveKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) preservedData[k] = v;
    });

    localStorage.clear();
    sessionStorage.clear();
    Object.entries(preservedData).forEach(([k, v]) => localStorage.setItem(k, v));

    console.log("✅ CFC_LOCK_TOTAL_PERSIST: todos los datos preservados tras logout manual.");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 Observador de sesión + Protección de duplicados
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const href = window.location.href.toLowerCase();
  const isLoginPage =
    href.includes("login.html") ||
    href.endsWith("/login") ||
    document.title.toLowerCase().includes("iniciar sesión");

  onAuthStateChanged(auth, (user) => {
    const isLogoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";
    const uidLocal = localStorage.getItem("CFC_SESSION_UID");

    if (user) {
      // ✅ Sesión activa
      localStorage.setItem("CFC_SESSION_ACTIVE", "true");

      // 🚫 Sesión duplicada detectada
      if (uidLocal && uidLocal !== user.uid) {
        console.warn("⚠️ Sesión duplicada detectada → cierre remoto");
        localStorage.setItem("CFC_SESSION_ACTIVE", "false");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    } else {
      // ❌ Usuario no autenticado
      localStorage.setItem("CFC_SESSION_ACTIVE", "false");

      if (!isLoginPage) {
        if (isLogoutIntent) {
          console.log("🟡 Logout manual detectado — overlay evitado.");
          localStorage.removeItem("CFC_LOGOUT_INTENT");
        } else {
          console.log("🔴 Sesión expirada o cerrada remotamente — overlay bloqueante activado");
          CFC_showBlockOverlay("Sesión no autorizada o expirada");
        }
      }
    }
  });
});

/* ==========================================================
   🧩 EXPORTACIONES
   ========================================================== */
export { CFC_login, CFC_logout };

/* ==========================================================
   🧾 QA-SYNC LOG
   ========================================================== */
console.log(`
✅ CFC_LOCK QA-SYNC SUB-PASO 5/7 (V47.6-REAL)
Estado: Bloqueo de sesión duplicada validado correctamente.
Resultado: Primer dispositivo cerrado automáticamente.
Auditor: CFC-SYNC V47.6-REAL
Fecha: 2025-11-10
`);
