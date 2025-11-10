/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V48.0_SYNC_TOTAL
   Sistema: CFC-LOCK — Sesión única + preservación de progreso
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
console.log("🔥 Firebase inicializado correctamente — V48.0");

/* ==========================================================
   🧮 Helpers
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — crea sesión remota y conserva progreso previo
   ========================================================== */
export async function CFC_login(email, pass) {
  try {
    // ⏳ Guardar estado previo del temporizador antes de limpiar
    const preserveTimer = localStorage.getItem("CFC_TIMER");
    const preserveTotal = localStorage.getItem("CFC_time_total");

    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const sessionId = makeSessionId();

    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ID", sessionId);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_LAST_LOGIN", new Date().toISOString());

    // ✅ Restaurar temporizador si existía
    if (preserveTimer) localStorage.setItem("CFC_TIMER", preserveTimer);
    if (preserveTotal) localStorage.setItem("CFC_time_total", preserveTotal);

    await setDoc(doc(db, "sessions", user.uid), {
      sessionId,
      updatedAt: serverTimestamp()
    });

    console.log(`🧩 Sesión activa: UID=${user.uid} | SID=${sessionId}`);
    window.location.href = "../index.html";
  } catch (err) {
    alert("Error al iniciar sesión: " + err.message);
  }
}

/* ==========================================================
   🔒 LOGOUT — preserva datos del Campus (progreso, tiempo, etc.)
   ========================================================== */
export async function CFC_logout() {
  try {
    const uid = localStorage.getItem("CFC_SESSION_UID");
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");

    // 🧩 Preservar claves críticas (temporizador, progreso, etc.)
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

    console.log("✅ Logout completo y progreso preservado");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 SESIÓN ÚNICA + DETECCIÓN REMOTA UNIFICADA
   ========================================================== */
let unsubscribeSession = null;
let tokenInterval = null;

onAuthStateChanged(auth, async (user) => {
  const href = window.location.href.toLowerCase();
  const isLoginPage = href.includes("login.html");
  const logoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";

  if (!user) {
    localStorage.setItem("CFC_SESSION_ACTIVE", "false");
    if (!isLoginPage && !logoutIntent) {
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      console.warn("🔴 Sesión cerrada remotamente");
    }
    if (unsubscribeSession) unsubscribeSession();
    localStorage.removeItem("CFC_LOGOUT_INTENT");
    return;
  }

  const uid = user.uid;
  const sessionIdLocal = localStorage.getItem("CFC_SESSION_ID") || makeSessionId();
  localStorage.setItem("CFC_SESSION_UID", uid);
  localStorage.setItem("CFC_SESSION_ID", sessionIdLocal);
  localStorage.setItem("CFC_SESSION_ACTIVE", "true");

  const ref = doc(db, "sessions", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { sessionId: sessionIdLocal, updatedAt: serverTimestamp() });
  } else {
    const data = snap.data();
    if (data.sessionId !== sessionIdLocal) {
      console.warn("⚠️ Sesión duplicada detectada → cierre inmediato.");
      await signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      return;
    }
  }

  // 🔁 Listener unificado (detector de cambios)
  if (unsubscribeSession) unsubscribeSession();
  unsubscribeSession = onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) {
      console.warn("🛑 Documento Firestore eliminado → cierre remoto");
      signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      return;
    }
    const remote = docSnap.data();
    const localSID = localStorage.getItem("CFC_SESSION_ID");
    if (remote.sessionId !== localSID) {
      console.warn("⚠️ Cambio remoto detectado → cierre inmediato.");
      signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
    }
  });

  // 🔄 Refresco de token (previene expiraciones invisibles)
  if (tokenInterval) clearInterval(tokenInterval);
  tokenInterval = setInterval(async () => {
    try { await getIdToken(user, true); }
    catch (e) {
      console.warn("⚠️ Token inválido — cierre automático");
      await signOut(auth);
      CFC_showBlockOverlay("🚫 Sesión cerrada o expirada");
    }
  }, 60000);
});

console.log(`
✅ CFC_LOCK QA-SYNC FINAL V48.0 — Sesión única funcional y temporizador persistente
Fecha: ${new Date().toISOString()}
`);
