/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V57.3_DEVICE_BIND_MODE_FINAL
   Sistema: Campus CFC LITE V41-DEMO
   Función: Sesión Única Cross-Device + DeviceID + Heartbeat
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
   🔐 LOGIN — Crea sesión única por dispositivo
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

    // Marca forzada
    const force = Math.random().toString(36).substring(2, 12);

    // Registrar sesión con device_id y timestamp
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
    localStorage.setItem("CFC_HEARTBEAT", Date.now().toString());

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
   ⚡ MONITOR — Detecta cambio de device remoto
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
    const remoteSID = data.session_id;
    const remoteDID = data.device_id;
    const active = data.active_session;

    if (!active) {
      console.warn("🚨 Sesión desactivada remotamente.");
      triggerLogout("⚠️ Tu sesión fue cerrada por otro inicio.");
    }

    if (remoteDID && remoteDID !== did) {
      console.warn("🚨 Nuevo dispositivo detectado. Cierre inmediato.");
      triggerLogout("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
    }
  });
}

/* ==========================================================
   💓 HEARTBEAT — Actualiza last_active cada 10s
   ========================================================== */
function startHeartbeat(email, sid, did) {
  const ref = doc(db, "licenses", email);
  setInterval(async () => {
    try {
      await updateDoc(ref, {
        last_active: serverTimestamp(),
        updated_at_iso: nowISO(),
        heartbeat: nowISO(),
      });
      console.log("💓 Heartbeat enviado:", did);
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
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V57.3_DEVICE_BIND_MODE_FINAL
-----------------------------------------
🔹 DeviceID persistente (localStorage)
🔹 Cierre remoto por cambio de dispositivo
🔹 Heartbeat 10s + last_active
🔹 100 % Cloudflare SAFE compatible
-----------------------------------------
`);
