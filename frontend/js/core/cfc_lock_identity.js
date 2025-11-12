/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V61.0_FIRESTORE_RENDER_SYNC
   Sistema: Campus CFC LITE V41-DEMO
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { checkSession, startHeartbeat, registerLogin, triggerLogout } from "./cfc_api.js";

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================
   🔹 Firebase SAFE Config
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
  console.log("🧩 Firebase inicializado (modo SAFE)");
} catch (err) {
  console.error("❌ Error Firebase:", err);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();
const makeDeviceId = () => {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("CFC_DEVICE_ID", id);
  }
  return id;
};

/* ==========================================================
   🔐 LOGIN (Firebase + Render Proxy)
   ========================================================== */
export async function CFC_login(email, license) {
  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();
  const ref = doc(db, "licenses", e);

  await setDoc(
    ref,
    {
      email: e,
      license_key: k,
      session_id: sid,
      device_id: did,
      active_session: true,
      last_active: serverTimestamp(),
      updated_at_iso: nowISO(),
    },
    { merge: true }
  );

  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  console.log(`✅ Login Firebase OK | device_id=${did}`);

  const registered = await registerLogin(e, did);
  if (!registered) {
    CFC_showBlockOverlay("⚠️ No se pudo registrar el login en el servidor Render.");
    return;
  }

  const valid = await checkSession(e, did);
  if (!valid) return;

  startHeartbeat(e, did);
  startServerPolling(e, did);
  listenRemoteLogout(e, ref, did);
  setTimeout(() => (window.location.href = "../index.html"), 800);
}

/* ==========================================================
   🔍 POLLING SERVIDOR — Validación periódica
   ========================================================== */
function startServerPolling(email, did) {
  setInterval(async () => {
    try {
      const valid = await checkSession(email, did);
      if (!valid) {
        console.warn("🚨 Sesión invalidada por el servidor Render.");
        triggerLogout("⚠️ Tu sesión fue cerrada automáticamente (otro dispositivo inició sesión).");
      }
    } catch (err) {
      console.warn("⚠️ Error en polling servidor:", err.message);
    }
  }, 10000);
}

/* ==========================================================
   🔔 LISTENER FIRESTORE — Detección remota en tiempo real
   ========================================================== */
function listenRemoteLogout(email, ref, did) {
  onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    const active = data.active_session ?? true;
    const storedDid = localStorage.getItem("CFC_DEVICE_ID");

    if (!active && storedDid === did) {
      console.warn("🚨 Firestore detectó cierre remoto → logout inmediato");
      triggerLogout("⚠️ Tu sesión fue cerrada desde otro dispositivo.");
    }
  });
}

/* ==========================================================
   🧩 AUTOLOAD — Reanudar sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (e && did) {
    console.log("♻️ Restaurando sesión previa:", e);
    startHeartbeat(e, did);
    startServerPolling(e, did);
    const ref = doc(db, "licenses", e);
    listenRemoteLogout(e, ref, did);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V61.0_FIRESTORE_RENDER_SYNC
────────────────────────────────────────────
🔹 Listener Firestore activo
🔹 Logout inmediato al detectar active_session=false
🔹 Mantiene Render heartbeat
────────────────────────────────────────────
`);
