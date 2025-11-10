/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V49.1_REALTIME_HYBRID_FIX_FINAL
   Sistema: CFC-LOCK — Cierre remoto automático entre dispositivos
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
  getDoc,
  getDocFromServer,
  onSnapshot,
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
   🔧 Inicialización SAFE (sin recaptcha ni cache)
   ========================================================== */
try {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApp();

  const safeGlobal = globalThis;
  safeGlobal.firebase = safeGlobal.firebase || {};
  safeGlobal.firebase.auth = safeGlobal.firebase.auth || {};
  safeGlobal.firebase.auth.AuthImpl = safeGlobal.firebase.auth.AuthImpl || {};
  safeGlobal.firebase.auth.AuthImpl.prototype =
    safeGlobal.firebase.auth.AuthImpl.prototype || {};
  safeGlobal.firebase.auth.AuthImpl.prototype._getRecaptchaConfig = () => null;

  auth = getAuth(app);
  db = getFirestore(app);
  await setPersistence(auth, browserLocalPersistence);

  console.log("🧩 Cloudflare SAFE init completado sin reCAPTCHA.");
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
    console.log(`[QA-SYNC] 🟡 Intentando login con: ${email}`);
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const newSID = makeSessionId();

    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ID", newSID);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");

    await setDoc(doc(db, "sessions", user.uid), {
      sessionId: newSID,
      updatedAt: serverTimestamp(),
    });

    console.log(`[QA-SYNC] ✅ Sesión creada: UID=${user.uid}, SID=${newSID}`);
    window.location.href = "../index.html";
  } catch (err) {
    console.error("❌ Error en login:", err);
    alert("Error al iniciar sesión: " + (err.message || err.code));
  }
}

/* ==========================================================
   🔒 LOGOUT
   ========================================================== */
export async function CFC_logout() {
  try {
    const uid = localStorage.getItem("CFC_SESSION_UID");
    if (uid && db) {
      try {
        await deleteDoc(doc(db, "sessions", uid));
        console.log(`[QA-SYNC] 🗑️ Sesión remota eliminada UID=${uid}`);
      } catch (e) {
        console.warn("⚠️ Error al eliminar sesión:", e);
      }
    }
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 MONITOR HÍBRIDO — cierre remoto entre dispositivos
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const uid = user.uid;
    const sessionRef = doc(db, "sessions", uid);
    const localSID = localStorage.getItem("CFC_SESSION_ID");

    /* 🔹 Listener realtime si Firestore WebSocket disponible */
    try {
      const unsub = onSnapshot(sessionRef, (snap) => {
        const remoteSID = snap.data()?.sessionId;
        if (remoteSID && localSID && remoteSID !== localSID) {
          console.warn("[QA-SYNC] 🚨 Cierre remoto detectado (onSnapshot)");
          signOut(auth);
          CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        }
      });
      console.log("📡 Listener Firestore activo (realtime).");
    } catch {
      console.log("⚙️ Listener no disponible, se usará modo polling híbrido.");
    }

    /* 🔹 Polling directo al servidor cada 8 s */
    setInterval(async () => {
      try {
        const snap = await getDocFromServer(sessionRef);
        const remoteSID = snap.data()?.sessionId;
        if (remoteSID && localSID && remoteSID !== localSID) {
          console.warn("[QA-SYNC] 🚨 Cierre remoto detectado (getDocFromServer)");
          await signOut(auth);
          CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        }
      } catch (err) {
        console.warn("⚠️ Error verificando sesión:", err);
      }
    }, 8000);

    console.log(`[QA-SYNC] 👁️ Monitoreo híbrido activo para UID=${uid}`);
  });
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V49.1_REALTIME_HYBRID_FIX_FINAL
-----------------------------------------
🔹 Cloudflare SAFE mode (sin recaptcha)
🔹 Firestore híbrido (snapshot + getDocFromServer)
🔹 Verificación cada 8 s sin cache local
🔹 Overlay activo (CFC_showBlockOverlay)
🔹 Auditor: CFC-SYNC QA FINAL — 2025-11-10
-----------------------------------------
`);
