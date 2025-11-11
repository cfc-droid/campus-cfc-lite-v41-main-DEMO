/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V53.2_FORCE_BOOT_MONITOR
   Sistema: CFC-LOCK — Cloudflare SAFE (sin backend)
   Auditor: CFC-SYNC QA FINAL — 2025-11-11
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
  getDoc,
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
  console.log("🧩 Firebase init — FORCE BOOT MONITOR MODE");
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
      updatedAtISO: nowISO(),
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
   🧠 MONITOR remoto — SDK directo (sin REST)
   ========================================================== */
async function getRemoteSession(uid) {
  try {
    const ref = doc(db, "sessions", uid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      sid: data.sessionId || null,
      updatedISO: data.updatedAtISO || null,
    };
  } catch (err) {
    console.warn("⚠️ Error remoto SDK:", err);
    return null;
  }
}

/* ==========================================================
   🔁 MONITOR ACTIVO — Realtime con onSnapshot()
   ========================================================== */
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

function startRealtimeMonitor() {
  const uid = localStorage.getItem("CFC_SESSION_UID");
  const localSID = localStorage.getItem("CFC_SESSION_ID");
  const localUpdate = localStorage.getItem("CFC_SESSION_LASTUPDATE");

  if (!uid || !localSID) return;

  console.log(`[QA-SYNC] ⚡ Realtime Monitor activo para UID=${uid}`);

  const ref = doc(db, "sessions", uid);

  onSnapshot(ref, async (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.data();
    const remoteSID = data.sessionId;
    const remoteTime = new Date(data.updatedAtISO).getTime();
    const localTime = new Date(localUpdate).getTime();
    const diff = Math.abs(remoteTime - localTime);

    if (remoteSID !== localSID && diff < 60000) {
      console.warn("[QA-SYNC] 🚨 Sesión duplicada detectada — cierre remoto");
      localStorage.clear();
      await signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
    }
  });
}

/* ==========================================================
   🧩 INICIO AUTOMÁTICO DEL MONITOR
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  startRealtimeMonitor();
  onAuthStateChanged(auth, (user) => {
    if (user) console.log(`[QA-SYNC] 👁️ Usuario autenticado: ${user.email}`);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V54.0_ONSNAPSHOT_REALTIME_MODE
-----------------------------------------
🔹 Listener Firestore onSnapshot()
🔹 Cierre inmediato entre dispositivos
🔹 100 % Cloudflare SAFE — sin backend
-----------------------------------------
`);
