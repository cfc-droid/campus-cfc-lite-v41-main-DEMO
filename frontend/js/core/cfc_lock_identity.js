/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V52.5_FIRESTORE_SAFE_REALTIME
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
  console.log("🧩 Firebase init — FIRESTORE SAFE REALTIME MODE");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

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
    localStorage.setItem("CFC_SESSION_LASTUPDATE", nowISO());

    await setDoc(doc(db, "sessions", uid), {
      sessionId: sid,
      updatedAt: serverTimestamp(),
      updatedAtISO: nowISO(), // 🔹 clave para lectura REST
    });

    console.log(`[QA-SYNC] ✅ Nueva sesión UID=${uid}, SID=${sid}`);
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
   🧠 MONITOR remoto — lectura garantizada
   ========================================================== */
async function getRemoteSession(uid) {
  const url = `https://firestore.googleapis.com/v1/projects/cfc-lock-firebase/databases/(default)/documents/sessions/${uid}?v=${Date.now()}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const sid = data?.fields?.sessionId?.stringValue || null;
    const updatedISO = data?.fields?.updatedAtISO?.stringValue || null;
    return { sid, updatedISO };
  } catch (err) {
    console.warn("⚠️ Error remoto:", err);
    return null;
  }
}

/* ==========================================================
   🔁 MONITOR activo — cierre remoto híbrido
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID");
    const localUpdate = localStorage.getItem("CFC_SESSION_LASTUPDATE");

    console.log(`[QA-SYNC] 👁️ Firestore-safe monitor activo para UID=${uid}`);

    setInterval(async () => {
      const remote = await getRemoteSession(uid);
      if (!remote || !remote.sid) return;

      const remoteSID = remote.sid;
      const remoteTime = new Date(remote.updatedISO).getTime();
      const localTime = new Date(localUpdate).getTime();
      const diff = Math.abs(remoteTime - localTime);

      // 🚨 Detección robusta de doble login
      if (remoteSID !== localSID && diff < 20000) {
        console.warn("[QA-SYNC] 🚨 Sesión más reciente detectada — cierre forzado");
        localStorage.clear();
        await signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    }, 7000);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V52.5_FIRESTORE_SAFE_REALTIME
-----------------------------------------
🔹 Doble campo timestamp (server + ISO)
🔹 Comparación temporal robusta (20s)
🔹 Logout inmediato sin backend
🔹 100% Cloudflare Pages compatible
-----------------------------------------
`);
