/* ==========================================================
   🔐 CFC_LOCK_IDENTITY_V72_ENFORCE_REAL
   Subpaso: 6.7 — Listener Firestore + expulsión real
   Auditor: CFC-SYNC
   ========================================================== */

import { CFC_showBlockOverlay } from "./overlay_block.js";

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

/* ==========================================================
   Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let db = null;
try {
  db = getFirestore(getApps().length ? getApp() : initializeApp(firebaseConfig));
  console.log("🧩 Firebase cargado (ENFORCE)");
} catch (err) {
  console.error("❌ Error inicializando Firebase:", err);
}

/* ==========================================================
   Utilidades
   ========================================================== */
const nowISO = () => new Date().toISOString();

const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const makeDeviceId = () => {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("CFC_DEVICE_ID", id);
  }
  return id;
};

/* ==========================================================
   Guardar en Firestore versión ENFORCE
   ========================================================== */
async function registerSessionEnforce(email, device_id, session_id) {
  try {
    await setDoc(doc(db, "sessions", email), {
      email,
      device_id,
      session_id,
      active_session: true,
      last_active: serverTimestamp(),
      updated_at_iso: nowISO()
    });

    console.log("🟢 [ENFORCE] Sesión registrada Firestore:", {
      email,
      device_id,
      session_id
    });
  } catch (err) {
    console.error("❌ Error registrando sesión (ENFORCE):", err);
  }
}

/* ==========================================================
   Expulsión desde FIRESTORE SNAPSHOT
   ========================================================== */
async function forceLogoutFS(reason, email, device_id) {
  console.warn("🚨 SNAPSHOT → expulsión:", reason);

  CFC_showBlockOverlay(email, device_id, reason);

  const preserve = ["CFC_PROGRESS", "CFC_TIMER", "CFC_LAST_MODULE"];
  const todo = Object.keys(localStorage);
  for (const k of todo) {
    if (!preserve.includes(k)) localStorage.removeItem(k);
  }
  sessionStorage.clear();

  setTimeout(() => {
    window.location.href = "/frontend/html/login.html";
  }, 1500);
}

/* ==========================================================
   Listener ENFORCE (expulsión)
   ========================================================== */
function listenEnforce(email, device_id) {
  const ref = doc(db, "sessions", email);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    console.log("📡 SNAPSHOT ENFORCE:", data);

    if (data.device_id !== device_id) {
      forceLogoutFS("Sesión iniciada en otro dispositivo (FIRESTORE)", email, device_id);
    }

    if (data.active_session === false) {
      forceLogoutFS("Sesión cerrada remotamente (FIRESTORE)", email, device_id);
    }
  });
}

/* ==========================================================
   Render Hybrid (primera validación)
   ========================================================== */
async function checkRender(email, device_id) {
  try {
    const res = await fetch(
      `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${device_id}`
    );
    const json = await res.json();
    console.log("🌐 Render check (ENFORCE):", json);

    if (json.status === "invalid" || json.status === "expired") {
      forceLogoutFS("Sesión iniciada en otro dispositivo (RENDER INIT)", email, device_id);
    }
  } catch (err) {
    console.warn("⚠️ Error Render:", err);
  }
}

/* ==========================================================
   CFC_login — versión ENFORCE REAL
   ========================================================== */
export async function CFC_login(email, license) {
  console.log("🧩 CFC_login() — ENFORCE REAL");

  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();

  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  await registerSessionEnforce(e, did, sid);

  listenEnforce(e, did);

  checkRender(e, did);

  return { email: e, device_id: did, session_id: sid };
}

/* ==========================================================
   Export global
   ========================================================== */
window.CFC_login = CFC_login;

console.log("🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_ENFORCE_REAL cargado");
