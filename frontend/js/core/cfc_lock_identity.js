/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V48.2_REAL_FIX_FINAL
   Sistema: CFC-LOCK — Sesión única + reinicio temporizador
   Auditoría QA-SYNC: 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, getIdToken
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
console.log("🔥 Firebase inicializado — V48.2");

/* ==========================================================
   🧩 Helpers
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ==========================================================
   🔐 LOGIN — fuerza reemplazo de sesión previa
   ========================================================== */
export async function CFC_login(email, pass) {
  try {
    const preserveKeys = ["CFC_TIMER", "CFC_time_total"];
    const preserved = {};
    preserveKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) preserved[k] = v;
    });

    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const uid = user.uid;
    const newSID = makeSessionId();

    // 🔄 Borrar sesión previa en Firestore para asegurar regeneración
    await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await sleep(400); // leve delay para evitar conflicto snapshot

    await setDoc(doc(db, "sessions", uid), {
      sessionId: newSID,
      updatedAt: serverTimestamp()
    });

    localStorage.setItem("CFC_SESSION_UID", uid);
    localStorage.setItem("CFC_SESSION_ID", newSID);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_LAST_LOGIN", new Date().toISOString());
    Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));

    // 🕒 Reiniciar temporizador a cero (nuevo inicio de sesión)
    localStorage.setItem("CFC_TIMER", "0");
    localStorage.setItem("CFC_time_total", "0");

    console.log(`🧩 Sesión regenerada UID=${uid} | SID=${newSID}`);
    window.location.href = "../index.html";
  } catch (err) {
    console.error("❌ Error en CFC_login:", err);
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

    const preserveKeys = [
      "CFC_PROGRESS", "CFC_TIMER", "CFC_MODULE_STATE", "CFC_EMO_STATE",
      "CFC_LAST_LOGIN", "progressData", "progressPercent",
      "examResults", "examResults_backup", "exam_history",
      "studyStats", "CFC_time_total", "CFC_last_sync",
      "CFC_lastDate", "CFC_days", "CFC_totalDays",
      "emotionScore", "CFC_THEME_STATE",
      "bitacoraData", "bitacoraFilters", "CFC_bitacoraState",
      "CFC_LOCK_BADGE", "CFC_LOCK_VERSION", "CFC_BADGE_STATE"
    ];
    const preserved = {};
    preserveKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) preserved[k] = v;
    });

    if (uid) await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await signOut(auth);

    localStorage.clear();
    sessionStorage.clear();
    Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));

    console.log("✅ Logout completo — progreso preservado");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 Listener unificado de sesión (activo en todos los tabs)
   ========================================================== */
if (!window.CFC_SESSION_WATCHER_ACTIVE) {
  window.CFC_SESSION_WATCHER_ACTIVE = true;

  let unsubscribe = null;
  let tokenTimer = null;

  onAuthStateChanged(auth, async (user) => {
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
      console.warn("⚠️ Sesión duplicada detectada → cierre inmediato.");
      await signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      return;
    }

    // 🔁 Observador remoto
    if (unsubscribe) unsubscribe();
    unsubscribe = onSnapshot(ref, (s) => {
      if (!s.exists()) {
        console.warn("🛑 Documento eliminado → cierre remoto");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        return;
      }
      const remote = s.data();
      if (remote.sessionId !== localSID) {
        console.warn("⚠️ Cambio remoto detectado → cierre inmediato");
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      }
    });

    // 🔄 Token refresh
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
✅ CFC_LOCK QA-SYNC FINAL V48.2 — Un solo listener + reinicio temporizador
Fecha: ${new Date().toISOString()}
`);
