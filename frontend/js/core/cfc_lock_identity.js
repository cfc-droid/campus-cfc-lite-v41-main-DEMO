/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V57.5_SERVER_SYNC_MODE_FINAL
   Sistema: Campus CFC LITE V41-DEMO
   Función: Sesión Única Cross-Device + Server Polling SAFE
   Auditor: QA-SYNC — 2025-11-12
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { checkSessionStatus, notifyHeartbeat } from "./cfc_api.js";

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
   🔐 LOGIN
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

  console.log(`✅ Login OK | device_id=${did}`);

  startHeartbeat(e, did);
  startServerPolling(e, did);

  setTimeout(() => (window.location.href = "../index.html"), 800);
}

/* ==========================================================
   💓 HEARTBEAT — Notifica actividad
   ========================================================== */
function startHeartbeat(email, did) {
  setInterval(() => notifyHeartbeat(email, did), 10000);
}

/* ==========================================================
   🔍 POLLING SERVIDOR — Verifica estado cada 10 s
   ========================================================== */
function startServerPolling(email, did) {
  setInterval(async () => {
    try {
      const status = await checkSessionStatus(email, did);
      if (status === "invalid") {
        console.warn("🚨 Sesión invalidada por servidor.");
        triggerLogout("⚠️ Tu sesión fue cerrada por otro dispositivo (server).");
      }
    } catch (err) {
      console.warn("⚠️ Error en polling servidor:", err.message);
    }
  }, 10000);
}

/* ==========================================================
   🔁 Logout visual
   ========================================================== */
function triggerLogout(msg) {
  localStorage.clear();
  CFC_showBlockOverlay(msg);
  setTimeout(() => (window.location.href = "../html/login.html"), 1500);
}

/* ==========================================================
   🧩 AUTOLOAD
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (e && did) {
    console.log("♻️ Restaurando sesión previa:", e);
    startHeartbeat(e, did);
    startServerPolling(e, did);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V57.5_SERVER_SYNC_MODE_FINAL
-----------------------------------------
🔹 Polling seguro hacia micro backend
🔹 Heartbeat sincronizado con servidor
🔹 Cierre inmediato si server detecta duplicado
-----------------------------------------
`);
