/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V48.3_REINIT_FIX_FINAL
   Sistema: CFC-LOCK — Re-inicialización controlada + sesión única real
   Auditoría QA-SYNC: 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, getIdToken, deleteUser
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot,
  serverTimestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

/* ==========================================================
   🔹 Inicialización Firebase
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
  storageBucket: "cfc-lock-firebase.firebasestorage.app",
  messagingSenderId: "352796893243",
  appId: "1:352796893243:web:a2bb8b30a35f45579efc1e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("🔥 Firebase inicializado — V48.3");

/* ==========================================================
   🧠 Helpers
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ==========================================================
   🔐 LOGIN — borra sesión vieja y re-inicia listener
   ========================================================== */
export async function CFC_login(email, pass) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const uid = user.uid;
    const newSID = makeSessionId();

    console.log(`🧠 Login detectado → UID=${uid}`);

    // 🔄 Apagar listener temporalmente
    window.CFC_SESSION_WATCHER_SUSPENDED = true;

    // 🧹 Borrar sesión vieja antes de crear la nueva
    await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await sleep(400);

    await setDoc(doc(db, "sessions", uid), {
      sessionId: newSID,
      updatedAt: serverTimestamp()
    });

    localStorage.setItem("CFC_SESSION_UID", uid);
    localStorage.setItem("CFC_SESSION_ID", newSID);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_LAST_LOGIN", new Date().toISOString());
    localStorage.setItem("CFC_TIMER", "0");
    localStorage.setItem("CFC_time_total", "0");

    console.log(`✅ Nueva sesión creada: ${uid} | ${newSID}`);

    // 🔁 Reactivar listener con delay para evitar loop
    setTimeout(() => { window.CFC_SESSION_WATCHER_SUSPENDED = false; }, 1500);

    window.location.href = "../index.html";
  } catch (err) {
    console.error("❌ Error en login:", err);
    alert("Error al iniciar sesión: " + err.message);
  }
}

/* ==========================================================
   🔒 LOGOUT — preserva progreso
   ========================================================== */
export async function CFC_logout() {
  try {
    const uid = localStorage.getItem("CFC_SESSION_UID");
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");

    if (uid) await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await signOut(auth);

    const preserve = ["CFC_PROGRESS","CFC_TIMER","CFC_time_total"];
    const data = {};
    preserve.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = v; });
    localStorage.clear();
    Object.entries(data).forEach(([k,v])=>localStorage.setItem(k,v));

    console.log("✅ Logout exitoso con progreso preservado");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧩 Listener global — control remoto de sesión
   ========================================================== */
if (!window.CFC_SESSION_WATCHER_ACTIVE) {
  window.CFC_SESSION_WATCHER_ACTIVE = true;

  let unsubscribe = null;
  let tokenTimer = null;

  onAuthStateChanged(auth, async (user) => {
    if (window.CFC_SESSION_WATCHER_SUSPENDED) {
      console.log("⏸️ Listener suspendido temporalmente (login activo)");
      return;
    }

    const href = window.location.href.toLowerCase();
    const isLogin = href.includes("login.html");
    const logoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";

    if (!user) {
      localStorage.setItem("CFC_SESSION_ACTIVE", "false");
      if (!isLogin && !logoutIntent) {
        console.warn("🔴 Sesión cerrada remotamente");
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
      if (unsubscribe) unsubscribe();
      localStorage.removeItem("CFC_LOGOUT_INTENT");
      return;
    }

    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID");
    const ref = doc(db, "sessions", uid);

    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().sessionId !== localSID) {
      console.warn("⚠️ Sesión duplicada detectada → cierre inmediato");
      await signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      return;
    }

    if (unsubscribe) unsubscribe();
    unsubscribe = onSnapshot(ref, (docSnap) => {
      if (window.CFC_SESSION_WATCHER_SUSPENDED) return;

      if (!docSnap.exists()) {
        console.warn("🛑 Documento eliminado → cierre remoto");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        return;
      }

      const remote = docSnap.data();
      if (remote.sessionId !== localSID) {
        console.warn("⚠️ Cambio remoto detectado → cierre");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    });

    if (tokenTimer) clearInterval(tokenTimer);
    tokenTimer = setInterval(async () => {
      try { await getIdToken(user, true); }
      catch {
        await signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión expirada");
      }
    }, 60000);
  });
}

/* ==========================================================
   🧾 QA-SYNC LOG
   ========================================================== */
console.log(`
✅ CFC_LOCK QA-SYNC FINAL V48.3 — Reinit Fix completado
Fecha: ${new Date().toISOString()}
`);
