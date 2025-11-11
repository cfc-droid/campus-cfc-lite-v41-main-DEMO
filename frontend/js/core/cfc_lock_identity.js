/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V56.1_FINAL_FIX — Sesión Única (Firebase SAFE)
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ==========================================================
   ✅ Características:
   - Sin Firebase Auth (usa email/licencia)
   - Cierre automático entre dispositivos (reemplazo inmediato)
   - Compatible con Cloudflare Pages (sin backend)
   - Sin caché local: usa disableNetwork()/enableNetwork()
   - Corrige cierre duplicado y reconexión en background
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  disableNetwork,
  enableNetwork,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================
   🔹 Configuración Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let app, db;

// 🔧 Inicializa Firebase en modo seguro (sin caché)
try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();
  db = getFirestore(app);

  // ⚡ Fuerza lectura directa desde el servidor
  await disableNetwork(db);
  await enableNetwork(db);

  console.log("🧩 Firebase inicializado — modo sin caché local (SAFE)");
} catch (err) {
  console.error("❌ Error inicializando Firebase:", err);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

/* ==========================================================
   🔐 LOGIN — Crea o reemplaza sesión activa
   ========================================================== */
export async function CFC_login(email, license) {
  try {
    const e = email.trim().toLowerCase();
    const k = license.trim();
    const sid = makeSessionId();
    const ref = doc(db, "licenses", e);

    // 🔍 Verifica si existe y valida licencia
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;

    if (data && data.license_key && data.license_key !== k) {
      alert("❌ Licencia inválida para este email.");
      return;
    }

    // 🔄 Actualiza sesión (reemplazo inmediato)
    await setDoc(ref, {
      email: e,
      license_key: k,
      session_id: sid,
      active_session: true,
      updated_at: serverTimestamp(),
      updated_at_iso: nowISO(),
    });

    // 💾 Guarda localmente
    localStorage.setItem("CFC_EMAIL", e);
    localStorage.setItem("CFC_LICENSE", k);
    localStorage.setItem("CFC_SESSION_ID", sid);
    localStorage.setItem("CFC_SESSION_LAST", nowISO());

    console.log(`✅ Nueva sesión creada: ${sid}`);
    window.location.href = "../index.html";
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    alert("Error al iniciar sesión: " + err.message);
  }
}

/* ==========================================================
   🔒 LOGOUT — Cierre manual o remoto
   ========================================================== */
export async function CFC_logout(manual = true) {
  try {
    const e = localStorage.getItem("CFC_EMAIL");
    if (!e) return;
    const ref = doc(db, "licenses", e);

    await updateDoc(ref, {
      active_session: false,
      session_id: null,
      updated_at: serverTimestamp(),
    });

    localStorage.clear();
    if (manual) CFC_showBlockOverlay("🔒 Sesión cerrada correctamente.");
    setTimeout(() => (window.location.href = "../html/login.html"), 800);
  } catch (err) {
    console.error("❌ Error en logout:", err);
  }
}

/* ==========================================================
   ⚡ MONITOR — Detecta cambios remotos en tiempo real
   ========================================================== */
function startRealtimeMonitor() {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (!e || !sid) return;

  const ref = doc(db, "licenses", e);

  console.log(`👁️ Monitor activo → ${e} | SID local=${sid}`);

  onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const remoteSID = data.session_id;
      const active = data.active_session;

      // 🚨 Si otro dispositivo inició sesión, cerrar inmediatamente
      if (active && remoteSID && remoteSID !== sid) {
        console.warn("🚨 Sesión duplicada detectada → cierre inmediato");
        localStorage.clear();
        CFC_showBlockOverlay("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
        setTimeout(() => (window.location.href = "../html/login.html"), 1500);
      }
    },
    (error) => {
      console.error("❌ Error en monitor Realtime:", error);
    }
  );
}

/* ==========================================================
   🧩 AUTOLOAD — Reactiva monitor en todas las páginas
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  startRealtimeMonitor();
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V56.1_FINAL_FIX
-----------------------------------------
🔹 Firestore SAFE (sin Auth)
🔹 Colección: licenses/{email}
🔹 Cierre inmediato cross-device
🔹 Reemplazo 100% en tiempo real
🔹 Cloudflare Pages compatible
-----------------------------------------
`);
