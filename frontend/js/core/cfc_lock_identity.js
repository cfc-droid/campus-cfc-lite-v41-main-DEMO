/* ==========================================================
   ✅ CFC_LOCK_V47.6_REAL_DUPLICATE_PROTECT + FIRESTORE_SESSION
   Sistema: CFC-LOCK — Autenticación, persistencia total y
   bloqueo automático de sesiones duplicadas (refuerzo).
   Auditor: CFC-SYNC QA FINAL — 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdToken
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

/* ==========================================================
   🔹 Inicialización Firebase (copiá tus credenciales reales)
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
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("🔥 Firebase inicializado correctamente (CFC_LOCK + Firestore).");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🔐 Helpers
   ========================================================== */
function makeSessionId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function safeParse(v) {
  try { return JSON.parse(v); } catch { return null; }
}

/* ==========================================================
   🔐 LOGIN
   ========================================================== */
async function CFC_login(email, pass) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    // Generar sessionId y persistir local + firestore
    const sessionId = makeSessionId();
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());
    localStorage.setItem("CFC_SESSION_ID", sessionId);

    // Guardar en Firestore: sessions/<uid> -> { sessionId, ts }
    try {
      await setDoc(doc(db, "sessions", user.uid), {
        sessionId,
        updatedAt: serverTimestamp()
      });
      console.log("♻️ Session registrada en Firestore:", sessionId);
    } catch (e) {
      console.warn("⚠️ No se pudo escribir session en Firestore:", e);
    }

    // Redirigir al index del campus
    window.location.href = "../index.html";
  } catch (err) {
    alert("Error al iniciar sesión: " + (err.message || err.code));
  }
}

/* ==========================================================
   🔒 LOGOUT — Preservación total de datos del Campus
   ========================================================== */
async function CFC_logout() {
  try {
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");

    // Antes de desconectar, intentar invalidar session en Firestore
    const uid = localStorage.getItem("CFC_SESSION_UID");
    if (uid && db) {
      try {
        // Opcional: eliminar doc de session (invalida sesión)
        await deleteDoc(doc(db, "sessions", uid));
        console.log("🗑️ Session Firestore eliminada para uid:", uid);
      } catch (e) {
        console.warn("⚠️ Error eliminando session en Firestore:", e);
      }
    }

    // Ejecutar signOut de Firebase
    await signOut(auth);

    // 🔐 Bloque: claves a preservar (completo)
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

    const preservedData = {};
    preserveKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) preservedData[k] = v;
    });

    // 🔄 Limpieza completa
    localStorage.clear();
    sessionStorage.clear();

    // ♻️ Restauración completa
    Object.entries(preservedData).forEach(([k, v]) => localStorage.setItem(k, v));

    console.log("✅ CFC_LOCK_TOTAL_PERSIST: todos los datos preservados tras logout manual.");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 Observador de sesión + Protección de duplicados reforzada
   ========================================================== */
let firestoreUnsubscribe = null;
let tokenCheckerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const href = window.location.href.toLowerCase();
  const isLoginPage =
    href.includes("login.html") ||
    href.endsWith("/login") ||
    document.title.toLowerCase().includes("iniciar sesión");

  // Observador de Firebase Auth
  onAuthStateChanged(auth, async (user) => {
    const isLogoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";
    const uidLocal = localStorage.getItem("CFC_SESSION_UID");
    const sessionIdLocal = localStorage.getItem("CFC_SESSION_ID");

    // limpiar listeners previos
    if (firestoreUnsubscribe) { firestoreUnsubscribe(); firestoreUnsubscribe = null; }
    if (tokenCheckerInterval) { clearInterval(tokenCheckerInterval); tokenCheckerInterval = null; }

    if (user) {
      // Marca sesión activa local
      localStorage.setItem("CFC_SESSION_ACTIVE", "true");
      // Si no tenemos sessionId local, intentar sincronizar con Firestore o crear nueva
      try {
        const sessionDocRef = doc(db, "sessions", user.uid);
        const snap = await getDoc(sessionDocRef);
        if (!snap.exists()) {
          // No hay session registrada -> crearla
          const newSessionId = sessionIdLocal || makeSessionId();
          await setDoc(sessionDocRef, { sessionId: newSessionId, updatedAt: serverTimestamp() });
          localStorage.setItem("CFC_SESSION_ID", newSessionId);
          console.log("♻️ Nueva session creada en Firestore (no existía).");
        } else {
          const remote = snap.data();
          if (!sessionIdLocal) {
            // Ninguna session local -> adoptamos la remota
            localStorage.setItem("CFC_SESSION_ID", remote.sessionId);
            console.log("♻️ Adoptada session remota en localStorage.");
          } else if (sessionIdLocal !== remote.sessionId) {
            // Sesión duplicada detectada: la remote NO coincide con local -> cerrar
            console.warn("⚠️ Sesión duplicada / mismatch sessionId → cierre remoto.");
            try { await signOut(auth); } catch (e) {}
            CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
            return;
          }
        }

        // Subscribir a cambios remotos (si la sessionId se modifica, cerramos)
        firestoreUnsubscribe = onSnapshot(sessionDocRef, (snap2) => {
          if (!snap2.exists()) {
            // doc eliminado => se indicó logout remoto
            console.warn("⚠️ Session doc eliminado remotamente → cierre de sesión forzado.");
            try { signOut(auth); } catch(e) {}
            CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
            return;
          }
          const remoteData = snap2.data();
          const localSID = localStorage.getItem("CFC_SESSION_ID");
          if (remoteData && remoteData.sessionId && localSID && remoteData.sessionId !== localSID) {
            console.warn("⚠️ SessionId mismatch detectado por snapshot → cierre forzado.");
            try { signOut(auth); } catch(e) {}
            CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
          }
        });
      } catch (e) {
        console.warn("⚠️ Error sincronizando session Firestore:", e);
      }

      // Periodic token check: forzar refresh de token para detectar revocaciones a tiempo real
      tokenCheckerInterval = setInterval(async () => {
        try {
          // Forzar refresh; si falla -> token revocado y onAuthStateChanged disparará
          await getIdToken(user, /* forceRefresh */ true);
        } catch (err) {
          console.warn("⚠️ getIdToken(true) falló — posible revocación:", err);
          try { await signOut(auth); } catch(e) {}
          CFC_showBlockOverlay("Sesión no autorizada o expirada");
        }
      }, 60 * 1000); // cada 60s
    } else {
      // No hay usuario autenticado
      localStorage.setItem("CFC_SESSION_ACTIVE", "false");

      if (!isLoginPage) {
        if (isLogoutIntent) {
          console.log("🟡 Logout manual detectado — overlay evitado.");
          localStorage.removeItem("CFC_LOGOUT_INTENT");
        } else {
          console.log("🔴 Sesión expirada o cerrada remotamente — overlay bloqueante activado");
          CFC_showBlockOverlay("Sesión no autorizada o expirada");
        }
      }
    }
  });
});

/* ==========================================================
   🧩 EXPORTACIONES
   ========================================================== */
export { CFC_login, CFC_logout };

/* ==========================================================
   🧾 QA-SYNC LOG
   ========================================================== */
console.log(`
✅ CFC_LOCK QA-SYNC SUB-PASO 5/7 (V47.6-REAL + Firestore)
Estado: Bloqueo de sesión duplicada reforzado con Firestore.
Resultado: Primer dispositivo cerrado automáticamente al iniciar sesión en otro.
Auditor: CFC-SYNC V47.6-REAL
Fecha: ${new Date().toISOString()}
`);
