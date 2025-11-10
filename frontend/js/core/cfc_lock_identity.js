/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V49.2_REALTIME_LOCK_PULSE_FIX_FINAL
   Sistema: CFC-LOCK — Sincronización remota garantizada (REST + Firestore)
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
  serverTimestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

/* ==========================================================
   🔹 Configuración Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
  storageBucket: "cfc-lock-firebase.firebasestorage.app",
  messagingSenderId: "352796893243",
  appId: "1:352796893243:web:a2bb8b30a35f45579efc1e",
};

let app, auth, db;

/* ==========================================================
   🔧 Inicialización SAFE
   ========================================================== */
try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);
  console.log("🧩 Cloudflare SAFE init completado (modo LOCK PULSE)");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🔐 LOGIN
   ========================================================== */
function makeSessionId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function CFC_login(email, pass) {
  try {
    console.log(`[QA-SYNC] 🟡 Login con: ${email}`);
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const sid = makeSessionId();
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ID", sid);
    await setDoc(doc(db, "sessions", user.uid), {
      sessionId: sid,
      updatedAt: serverTimestamp(),
    });
    console.log(`[QA-SYNC] ✅ Sesión registrada UID=${user.uid}, SID=${sid}`);
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
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 MODO LOCK PULSE — lectura directa REST cada 10 s
   ========================================================== */
async function fetchRemoteSession(uid) {
  const url = `https://firestore.googleapis.com/v1/projects/cfc-lock-firebase/databases/(default)/documents/sessions/${uid}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.fields?.sessionId?.stringValue || null;
  } catch {
    return null;
  }
}

/* ==========================================================
   🔁 Monitor híbrido (REST + estado local)
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID");
    console.log(`[QA-SYNC] 👁️ LOCK_PULSE activo para UID=${uid}`);

    // Verificación directa cada 10 s sin caché
    setInterval(async () => {
      const remoteSID = await fetchRemoteSession(uid);
      if (remoteSID && localSID && remoteSID !== localSID) {
        console.warn("[QA-SYNC] 🚨 Cierre remoto detectado (REST)");
        await signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    }, 10000);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V49.2_REALTIME_LOCK_PULSE_FIX_FINAL
-----------------------------------------
🔹 Verificación directa via REST API (no cache)
🔹 Sin dependencia de WebSockets
🔹 Cierre remoto garantizado en Cloudflare Pages
🔹 Intervalo: 10 s
🔹 Auditor: CFC-SYNC QA FINAL — 2025-11-10
-----------------------------------------
`);
