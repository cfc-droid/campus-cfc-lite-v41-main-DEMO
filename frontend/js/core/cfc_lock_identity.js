/* ==========================================================
   🔐 CFC_LOCK_IDENTITY_V72_HYBRID_SILENT
   Sistema: Campus CFC LITE V41
   Subpaso: 4.7 — Identidad híbrida REAL (PRUEBA 14)
   Modo: HYBRID-SILENT (detecta duplicados sin expulsar)
   ========================================================== */

/* ==========================================================
   🔹 IMPORTS PERMITIDOS
   ========================================================== */
import { CFC_showBlockOverlay } from "../overlay_block.js";

/* ==========================================================
   🔹 FIREBASE CONFIG — SAFE + HÍBRIDO 🎯
   ========================================================== */
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let db = null;
try {
  db = getFirestore(getApps().length ? getApp() : initializeApp(firebaseConfig));
  console.log("🧩 Firebase cargado en modo HYBRID-SILENT");
} catch (err) {
  console.error("❌ Error al inicializar Firebase:", err);
}

/* ==========================================================
   🔹 UTILIDADES
   ========================================================== */
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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
   🔥 REGISTRO EN FIRESTORE (HYBRID)
   Se usa SOLO después de login local real
   ========================================================== */
async function registerSessionHybrid(email, device_id, session_id) {
  try {
    await setDoc(doc(db, "sessions", email), {
      email,
      device_id,
      session_id,
      active_session: true,
      last_active: serverTimestamp(),
      updated_at_iso: nowISO()
    });

    console.log("🟢 [HYBRID] Sesión registrada en Firestore:");
    console.log({ email, device_id, session_id });
  } catch (err) {
    console.error("❌ Error registrando sesión híbrida:", err);
  }
}

/* ==========================================================
   🔹 LISTENER FIRESTORE (detecta duplicados)
   ========================================================== */
function listenHybrid(email, device_id) {
  const ref = doc(db, "sessions", email);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    console.log("📡 Firestore snapshot recibido:", data);

    if (data.device_id !== device_id) {
      console.warn("⚠️ [HYBRID] Duplicado detectado (otro device activo)");
      console.log("📌 MODO SILENT → NO expulsar");
    }
  });
}

/* ==========================================================
   🔥 Render Sync (solo detección)
   ========================================================== */
async function checkRenderHybrid(email, device_id) {
  try {
    const res = await fetch(
      `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
    );
    const json = await res.json();
    console.log("🌐 Render check →", json);

    if (json.status === "invalid") {
      console.warn("⚠️ Render detectó otro dispositivo activo (SILENT)");
    }
  } catch (err) {
    console.log("🔁 Error Render:", err.message);
  }
}

/* ==========================================================
   🔐 FUNCIÓN PRINCIPAL — CFC_login()
   (Se mantiene idéntica, solo agrega HYBRID dentro)
   ========================================================== */
export async function CFC_login(email, license) {
  console.log("🧩 CFC_login() ejecutado — identidad híbrida activada");

  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();

  // Guardado local
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  // Híbrido: registrar en Firestore
  await registerSessionHybrid(e, did, sid);

  // Híbrido: activar listener
  listenHybrid(e, did);

  // Híbrido: primera validación Render
  checkRenderHybrid(e, did);

  return { email: e, device_id: did, session_id: sid };
}

/* ==========================================================
   🔹 EXPORT GLOBAL CONTROLADA (PRUEBA 11)
   ========================================================== */
window.CFC_login = CFC_login;

console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_HYBRID_SILENT cargado");
