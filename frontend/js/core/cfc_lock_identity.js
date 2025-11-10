/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V51.0_PERSISTENCE_FORCED_MODE
   Sistema: CFC-LOCK — Cloudflare SAFE (sin backend)
   Auditor: CFC-SYNC QA FINAL — 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

/* ==========================================================
   🔹 Configuración Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let app, auth, db;

try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);
  console.log("🧩 Firebase init — PERSISTENCE-FORCED MODE");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN
   ========================================================== */
export async function CFC_login(email, pass) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const sid = makeSessionId();
    const uid = user.uid;

    localStorage.setItem("CFC_SESSION_UID", uid);
    localStorage.setItem("CFC_SESSION_ID", sid);

    await setDoc(doc(db, "sessions", uid), {
      sessionId: sid,
      active: true,
      updatedAt: serverTimestamp(),
    });

    console.log(`[QA-SYNC] ✅ Sesión creada UID=${uid}, SID=${sid}`);
    window.location.href = "../index.html";
  } catch (err) {
    alert("Error al iniciar sesión: " + (err.message || err.code));
  }
}

/* ==========================================================
   🔒 LOGOUT
   ========================================================== */
export async function CFC_logout() {
  try {
    const uid = localStorage.getItem("CFC_SESSION_UID");
    if (uid) await deleteDoc(doc(db, "sessions", uid));
    await signOut(auth);
    localStorage.clear();
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error en logout:", err);
  }
}

/* ==========================================================
   🧠 Monitor remoto sin cache (REST + token)
   ========================================================== */
async function getRemoteSession(uid) {
  const noCacheKey = `?v=${Date.now()}`;
  const url = `https://firestore.googleapis.com/v1/projects/cfc-lock-firebase/databases/(default)/documents/sessions/${uid}${noCacheKey}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "pragma": "no-cache",
        "cache-control": "no-store",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.fields?.sessionId?.stringValue || null;
  } catch {
    return null;
  }
}

/* ==========================================================
   🔁 Monitor activo
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID");
    console.log(`[QA-SYNC] 👁️ PERSISTENCE-FORCED activo para UID=${uid}`);

    setInterval(async () => {
      const remoteSID = await getRemoteSession(uid);
      if (!remoteSID) return;
      if (remoteSID !== localSID) {
        console.warn("[QA-SYNC] 🚨 Cierre remoto detectado (PERSISTENCE-FORCED)");
        localStorage.clear();
        await signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    }, 5000);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V51.0_PERSISTENCE_FORCED_MODE
-----------------------------------------
🔹 Llamadas REST sin cache + parámetro timestamp
🔹 Forzado de lectura cada 5s
🔹 Cloudflare Pages SAFE
🔹 Auditor: CFC-SYNC QA FINAL — 2025-11-10
-----------------------------------------
`);
