/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V68.0_FIRESTORE_RENDER_REALTIME
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

  // 1️⃣ Registrar en Firestore (sesión activa)
  await setDoc(
    ref,
    {
      email: e,
      license_key: k,
      session_id: sid,
      device_id: did,
      active_session: true,
      session_force_closed: false,
      last_active: serverTimestamp(),
      updated_at_iso: nowISO(),
    },
    { merge: true }
  );

  // 2️⃣ Guardar en localStorage
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  console.log(`✅ Login Firebase OK | device_id=${did}`);

  // 3️⃣ Registrar en servidor Render
  const registered = await registerLogin(e, did);
  if (!registered) {
    CFC_showBlockOverlay("⚠️ No se pudo registrar el login en el servidor Render.");
    return;
  }

  // 4️⃣ Verificar validez inmediata
  const valid = await checkSession(e, did);
  if (!valid) return;

  // 5️⃣ Activar latidos + monitoreo
  startHeartbeat(e, did);
  startServerPolling(e, did);
  startRealtimeSync(e, did); // NUEVO ✅ sincroniza Render + Firestore en tiempo real

  // 6️⃣ Redirigir
  setTimeout(() => (window.location.href = "../index.html"), 800);
}

/* ==========================================================
   🔍 POLLING SERVIDOR — Validación periódica (Render)
   ========================================================== */
function startServerPolling(email, did) {
  setInterval(async () => {
    try {
      const valid = await checkSession(email, did);
      if (!valid) {
        console.warn("🚨 Sesión invalidada por Render (checkSession)");
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
    const force = data.session_force_closed ?? false;
    const storedDid = localStorage.getItem("CFC_DEVICE_ID");

    if ((!active || force) && storedDid === did) {
      console.warn("🚨 Firestore detectó cierre remoto → logout inmediato");
      triggerLogout("⚠️ Tu sesión fue cerrada desde otro dispositivo.");
    }
  });
}

/* ==========================================================
   ⚡ Render Sync — chequeo activo de Render cada 15 s
   ========================================================== */
function startRealtimeSync(email, did) {
  setInterval(async () => {
    try {
      const res = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${did}`
      );
      const data = await res.json();
      if (data.status === "expired") {
        console.warn("🚨 Render detectó cierre remoto → logout inmediato");
        triggerLogout("⚠️ Tu sesión fue cerrada automáticamente (otro dispositivo inició sesión).");
      }
    } catch (err) {
      console.warn("⚠️ Error al sincronizar con Render:", err);
    }
  }, 15000);
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
    startRealtimeSync(e, did);
    const ref = doc(db, "licenses", e);
    listenRemoteLogout(e, ref, did);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V68.0_FIRESTORE_RENDER_REALTIME
────────────────────────────────────────────
🔹 Listener Firestore activo + cierre remoto inmediato
🔹 Polling + Render Sync combinados
🔹 Sincronización en tiempo real entre Firestore y Proxy
────────────────────────────────────────────
`);