/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V57.4_LAST_ACTIVE_COMPARATOR_FINAL
   Sistema: Campus CFC LITE V41-DEMO
   Función: Sesión Única Cross-Device + Comparador last_active
   Auditor: QA-SYNC — 2025-11-12
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
const nowMillis = () => Date.now();
const makeDeviceId = () => {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("CFC_DEVICE_ID", id);
    console.log("🔹 Nuevo device_id asignado:", id);
  }
  return id;
};

/* ==========================================================
   🔐 LOGIN — Crea sesión única
   ========================================================== */
export async function CFC_login(email, license) {
  try {
    const e = email.trim().toLowerCase();
    const k = license.trim();
    const sid = makeSessionId();
    const did = makeDeviceId();
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
        device_id: did,
        active_session: true,
        force_update: force,
        last_active: serverTimestamp(),
        updated_at_iso: nowISO(),
      },
      { merge: true }
    );

    localStorage.setItem("CFC_EMAIL", e);
    localStorage.setItem("CFC_LICENSE", k);
    localStorage.setItem("CFC_SESSION_ID", sid);
    localStorage.setItem("CFC_DEVICE_ID", did);
    localStorage.setItem("CFC_LAST_ACTIVE", nowMillis().toString());

    console.log(`✅ Sesión iniciada: ${sid} | device_id=${did}`);

    startRealtimeMonitor();
    startHeartbeat(e, sid, did);

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
      last_active: serverTimestamp(),
    });

    localStorage.clear();
    if (manual) CFC_showBlockOverlay("🔒 Sesión cerrada correctamente.");
    setTimeout(() => (window.location.href = "../html/login.html"), 800);
  } catch (err) {
    console.error("❌ Error en logout:", err);
  }
}

/* ==========================================================
   ⚡ MONITOR — Detecta cambio remoto o actividad más reciente
   ========================================================== */
function startRealtimeMonitor() {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (!e || !sid || !did) return;

  const ref = doc(db, "licenses", e);
  console.log(`👁️ Monitor activo → ${e} | SID=${sid} | DID=${did}`);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    const remoteDID = data.device_id;
    const remoteActive = data.active_session;
    const remoteLastActive = data.last_active?.toMillis?.() || 0;

    const localLastActive = parseInt(localStorage.getItem("CFC_LAST_ACTIVE") || "0", 10);

    // 🔸 Caso 1: Se detecta cambio directo de device
    if (remoteDID && remoteDID !== did) {
      console.warn("🚨 Nuevo dispositivo detectado. Cierre inmediato.");
      triggerLogout("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
      return;
    }

    // 🔸 Caso 2: El otro dispositivo tiene actividad más reciente
    if (remoteLastActive > localLastActive + 15000) {
      console.warn("🚨 Actividad más reciente detectada en otro dispositivo.");
      triggerLogout("⚠️ Tu sesión fue cerrada por actividad en otro dispositivo.");
      return;
    }

    // Debug QA
    console.log("📡 Monitor:", {
      remoteLastActive,
      localLastActive,
      diff: remoteLastActive - localLastActive,
    });
  });
}

/* ==========================================================
   💓 HEARTBEAT — Actualiza last_active cada 10s
   ========================================================== */
function startHeartbeat(email, sid, did) {
  const ref = doc(db, "licenses", email);
  setInterval(async () => {
    try {
      const now = nowMillis();
      localStorage.setItem("CFC_LAST_ACTIVE", now.toString());

      await updateDoc(ref, {
        last_active: serverTimestamp(),
        updated_at_iso: nowISO(),
        heartbeat: nowISO(),
      });
      console.log("💓 Heartbeat enviado:", did, "|", nowISO());
    } catch (err) {
      console.warn("⚠️ Error al enviar heartbeat:", err);
    }
  }, 10000);
}

/* ==========================================================
   🔁 FUNC AUX — Logout visual
   ========================================================== */
function triggerLogout(msg) {
  localStorage.clear();
  CFC_showBlockOverlay(msg);
  setTimeout(() => (window.location.href = "../html/login.html"), 1200);
}

/* ==========================================================
   🧩 AUTOLOAD — Restaura sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (e && sid && did) {
    console.log("♻️ Restaurando sesión previa:", sid, "| Device:", did);
    startRealtimeMonitor();
    startHeartbeat(e, sid, did);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V57.4_LAST_ACTIVE_COMPARATOR_FINAL
-----------------------------------------
🔹 DeviceID persistente (localStorage)
🔹 Comparador last_active + 15s diferencia
🔹 Cierre remoto automático por actividad
🔹 Heartbeat 10s + polling interno
🔹 100 % Cloudflare SAFE compatible
-----------------------------------------
`);
