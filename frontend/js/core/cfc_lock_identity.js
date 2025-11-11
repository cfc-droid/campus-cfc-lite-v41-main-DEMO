/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V57.2_HEARTBEAT_MODE_FINAL
   Sistema: Campus CFC LITE V41-DEMO
   Función: Sesión Única Cross-Device + Heartbeat SAFE
   Auditor: QA-SYNC — 2025-11-11
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

let db;
try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🧩 Firebase inicializado correctamente (modo Cloudflare SAFE)");
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
   🔐 LOGIN — Crea sesión única
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
      alert("❌ Licencia inválida o email no coincide.");
      return;
    }

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
    localStorage.setItem("CFC_HEARTBEAT", Date.now().toString());

    console.log(`✅ Sesión iniciada: ${sid}`);

    startRealtimeMonitor();
    startHeartbeat(e, sid);

    setTimeout(() => (window.location.href = "../index.html"), 800);
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
   ⚡ MONITOR — Cierre remoto en vivo
   ========================================================== */
function startRealtimeMonitor() {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (!e || !sid) return;

  const ref = doc(db, "licenses", e);
  console.log(`👁️ Monitor activo → ${e} | SID local=${sid}`);

  let lastForce = null;

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    const remoteSID = data.session_id;
    const active = data.active_session;
    const force = data.force_update || null;

    if (force === lastForce) return;
    lastForce = force;

    if (!active || (remoteSID && remoteSID !== sid)) {
      console.warn("🚨 Sesión duplicada detectada — cierre inmediato");
      localStorage.clear();
      CFC_showBlockOverlay(
        "⚠️ Tu sesión fue cerrada automáticamente por actividad en otro dispositivo."
      );
      setTimeout(() => (window.location.href = "../html/login.html"), 1200);
    }
  });
}

/* ==========================================================
   💓 HEARTBEAT — Refresca actividad cada 10s
   ========================================================== */
function startHeartbeat(email, sid) {
  const ref = doc(db, "licenses", email);
  setInterval(async () => {
    try {
      await updateDoc(ref, {
        updated_at: serverTimestamp(),
        heartbeat: nowISO(),
      });
      console.log("💓 Heartbeat enviado:", nowISO());
    } catch (err) {
      console.warn("⚠️ Error al enviar heartbeat:", err);
    }
  }, 10000);
}

/* ==========================================================
   🧩 AUTOLOAD — Reanuda sesión y monitor
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (e && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor();
    startHeartbeat(e, sid);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V57.2_HEARTBEAT_MODE_FINAL
-----------------------------------------
🔹 Sesión única Firestore Realtime
🔹 Detección inmediata cross-device
🔹 Heartbeat 10s (actividad viva)
🔹 100 % Cloudflare SAFE compatible
-----------------------------------------
`);
