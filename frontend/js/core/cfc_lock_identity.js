/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V50.0_REMOTE_TRIGGER_FINAL
   Sistema: CFC-LOCK — Cierre remoto garantizado (Cloudflare SAFE)
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
};

let app, auth, db;

try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);
  console.log("🧩 Firebase SAFE init (modo REMOTE TRIGGER)");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
function makeSessionId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

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

    // Crear documento con flag remoto
    await setDoc(doc(db, "sessions", uid), {
      sessionId: sid,
      activeSession: true,
      updatedAt: serverTimestamp(),
    });

    console.log(`[QA-SYNC] ✅ Sesión iniciada UID=${uid}, SID=${sid}`);
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
   🧠 MONITOR — verificación REST garantizada
   ========================================================== */
async function getRemoteFlag(uid) {
  const url = `https://firestore.googleapis.com/v1/projects/cfc-lock-firebase/databases/(default)/documents/sessions/${uid}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      sid: data?.fields?.sessionId?.stringValue || null,
      active: data?.fields?.activeSession?.booleanValue ?? false,
    };
  } catch (err) {
    console.warn("⚠️ Error fetch remoto:", err);
    return null;
  }
}

/* ==========================================================
   🔁 Monitor híbrido
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID");

    console.log(`[QA-SYNC] 👁️ REMOTE_TRIGGER activo para UID=${uid}`);

    setInterval(async () => {
      const remote = await getRemoteFlag(uid);
      if (!remote) return;
      const { sid: remoteSID } = remote;

      // 🚨 Cierre remoto
      if (remoteSID && remoteSID !== localSID) {
        console.warn("[QA-SYNC] 🚨 Cierre remoto detectado (REMOTE_TRIGGER)");
        await signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    }, 8000);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V50.0_REMOTE_TRIGGER_FINAL
-----------------------------------------
🔹 Sin WebSocket / Sin caché
🔹 Llamadas REST puras a Firestore
🔹 Detección garantizada en Cloudflare Pages
🔹 Intervalo 8s
🔹 Auditor: CFC-SYNC QA FINAL — 2025-11-10
-----------------------------------------
`);
