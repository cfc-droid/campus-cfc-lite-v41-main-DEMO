/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V56.3_FORCEUPDATE_FINAL — Sesión Única
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ==========================================================
   🔹 Características:
   - Cierre remoto instantáneo cross-device
   - Campo de control “force_update” evita cache silenciosa
   - Sin Firebase Auth, sin backend
   - Compatible Cloudflare Pages
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
try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();
  db = getFirestore(app);
  await disableNetwork(db);
  await enableNetwork(db);
  console.log("🧩 Firebase inicializado — modo sin caché local (SAFE)");
} catch (err) {
  console.error("❌ Error inicializando Firebase:", err);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;

    if (data && data.license_key && data.license_key !== k) {
      alert("❌ Licencia inválida para este email.");
      return;
    }

    // ⚡ Campo de control para forzar detección de snapshot
    const force = Math.random().toString(36).substring(2, 12);

    await setDoc(
      ref,
      {
        email: e,
        license_key: k,
        session_id: sid,
        active_session: true,
        force_update: force,
        updated_at: serverTimestamp(),
        updated_at_iso: nowISO(),
      },
      { merge: true }
    );

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
   🔒 LOGOUT — Manual o remoto
   ========================================================== */
export async function CFC_logout(manual = true) {
  try {
    const e = localStorage.getItem("CFC_EMAIL");
    if (!e) return;
    const ref = doc(db, "licenses", e);

    const force = Math.random().toString(36).substring(2, 12);

    await updateDoc(ref, {
      active_session: false,
      session_id: null,
      force_update: force,
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

  let lastForce = null;

  onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const remoteSID = data.session_id;
      const active = data.active_session;
      const force = data.force_update || null;

      // Evita repetir eventos
      if (force === lastForce) return;
      lastForce = force;

      // 🚨 Otro dispositivo inició sesión
      if (active && remoteSID && remoteSID !== sid) {
        console.warn("🚨 Sesión duplicada detectada → cierre inmediato");
        localStorage.clear();
        CFC_showBlockOverlay(
          "⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo."
        );
        setTimeout(() => (window.location.href = "../html/login.html"), 1500);
      }

      // 🔒 Sesión remota cerrada
      if (!active) {
        console.warn("🔒 Sesión remota cerrada → desconexión local");
        localStorage.clear();
        setTimeout(() => (window.location.href = "../html/login.html"), 1200);
      }
    },
    (error) => console.error("❌ Error en monitor Realtime:", error)
  );
}

/* ==========================================================
   🧩 AUTOLOAD — Reactiva monitor global
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  startRealtimeMonitor();
  window.addEventListener("online", () => {
    console.log("🌐 Conexión restablecida, reactivando monitor...");
    startRealtimeMonitor();
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V56.3_FORCEUPDATE_FINAL
-----------------------------------------
🔹 Firestore SAFE (sin Auth)
🔹 Colección: licenses/{email}
🔹 Cierre remoto instantáneo
🔹 Campo de control force_update
🔹 Cloudflare Pages compatible
-----------------------------------------
`);
