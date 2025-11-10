/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V48.6_CLOUDFLARE_FIX_FINAL
   Sistema: CFC-LOCK — Control de sesión única (sin backend)
   Auditor: CFC-SYNC QA FINAL — 2025-11-10
   ========================================================== */

import { CFC_showBlockOverlay } from "../overlay_block.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

import {
  initializeFirestore,
  clearIndexedDbPersistence,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc
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

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);

  // 🔧 Inicializar Firestore sin caché persistente
  db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    experimentalForceLongPolling: true,
    cacheSizeBytes: 0
  });

  clearIndexedDbPersistence(db)
    .then(() => console.log("🧹 IndexedDB Firestore limpiado correctamente."))
    .catch((err) => console.warn("⚠️ IndexedDB ya estaba limpio o no se pudo limpiar:", err));

  // 🔐 Inicializar Auth con persistencia local y sin recaptcha
  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("⚙️ Persistencia local configurada correctamente."))
    .catch(err => console.warn("⚠️ No se pudo establecer persistencia local:", err));

  // 🔧 Parche Cloudflare Pages — evita bug '_getRecaptchaConfig'
  auth._getRecaptchaConfig = () => null;

  console.log("🔥 Firebase inicializado correctamente (Cloudflare SAFE mode, sin recaptcha).");
} catch (e) {
  console.error("❌ Error inicializando Firebase:", e);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
function makeSessionId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ==========================================================
   🔐 LOGIN
   ========================================================== */
async function CFC_login(email, pass) {
  try {
    console.log(`[QA-SYNC] 🟡 Intentando login con: ${email}`);
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    const newSID = makeSessionId();
    localStorage.setItem("CFC_SESSION_UID", user.uid);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_SESSION_TIMESTAMP", new Date().toISOString());
    localStorage.setItem("CFC_SESSION_ID", newSID);

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
   🔒 LOGOUT (Preserva datos esenciales del Campus)
   ========================================================== */
async function CFC_logout() {
  try {
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");
    const uid = localStorage.getItem("CFC_SESSION_UID");

    // 🔐 Preservar progreso del usuario
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

    if (uid && db) {
      try {
        await deleteDoc(doc(db, "sessions", uid));
        console.log(`[QA-SYNC] 🗑️ Sesión remota eliminada UID=${uid}`);
      } catch (e) {
        console.warn("⚠️ Error al eliminar sesión en Firestore:", e);
      }
    }

    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    Object.entries(preservedData).forEach(([k, v]) => localStorage.setItem(k, v));

    console.log("[QA-SYNC] ✅ Logout completo (datos del Campus preservados).");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 OBSERVADOR PRINCIPAL (listener remoto)
   ========================================================== */
let unsubscribe = null;

document.addEventListener("DOMContentLoaded", () => {
  const href = window.location.href.toLowerCase();
  const isLoginPage =
    href.includes("login.html") ||
    href.endsWith("/login") ||
    document.title.toLowerCase().includes("iniciar sesión");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      const logoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";
      localStorage.setItem("CFC_SESSION_ACTIVE", "false");
      if (!isLoginPage && !logoutIntent) {
        console.warn("[QA-SYNC] 🔴 Sesión cerrada o expirada — overlay activado.");
        CFC_showBlockOverlay("🚫 Sesión cerrada o expirada");
      } else {
        localStorage.removeItem("CFC_LOGOUT_INTENT");
      }
      return;
    }

    const uid = user.uid;
    const localSID = localStorage.getItem("CFC_SESSION_ID") || makeSessionId();
    const sessionRef = doc(db, "sessions", uid);

    try {
      const snap = await getDoc(sessionRef);
      if (!snap.exists()) {
        await setDoc(sessionRef, { sessionId: localSID, updatedAt: serverTimestamp() });
        console.log(`[QA-SYNC] 🆕 Nueva sesión registrada para UID=${uid}`);
      } else {
        const remoteSID = snap.data().sessionId;
        if (remoteSID !== localSID) {
          console.warn(`[QA-SYNC] ⚠️ Mismatch inicial detectado (Local=${localSID}, Remote=${remoteSID})`);
          await signOut(auth);
          CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
          return;
        }
      }

      if (unsubscribe) unsubscribe();
      unsubscribe = onSnapshot(sessionRef, (docSnap) => {
        if (!docSnap.exists()) {
          console.warn("[QA-SYNC] ⚠️ Documento de sesión eliminado remotamente → cierre forzado.");
          signOut(auth);
          CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
          return;
        }

        const remoteData = docSnap.data();
        const remoteSID = remoteData?.sessionId || "undefined";
        const localSID2 = localStorage.getItem("CFC_SESSION_ID");
        const delta = Date.now() - Number(localSID2?.split("_")[0] || 0);

        console.log(`[QA-SYNC] 🔍 UID=${uid} | Local=${localSID2} | Remote=${remoteSID} | Δt=${delta}ms`);

        if (remoteSID && localSID2 && remoteSID !== localSID2) {
          console.warn("[QA-SYNC] 🚨 Mismatch detectado → cierre remoto instantáneo.");
          signOut(auth);
          CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        }
      });

      console.log(`[QA-SYNC] 👁️ Listener activo para UID=${uid}`);
    } catch (e) {
      console.error("[QA-SYNC] ❌ Error iniciando observador remoto:", e);
    }

    setInterval(async () => {
      try {
        await getIdToken(user, true);
      } catch (err) {
        console.warn("[QA-SYNC] ⚠️ Error de token — posible sesión expirada:", err);
        signOut(auth);
        CFC_showBlockOverlay("Sesión no autorizada o expirada");
      }
    }, 45000);
  });
});

/* ==========================================================
   🧩 EXPORTS
   ========================================================== */
export { CFC_login, CFC_logout };

/* ==========================================================
   🧾 QA-SYNC LOG (Diagnóstico)
   ========================================================== */
console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V48.6_CLOUDFLARE_FIX_FINAL
-----------------------------------------
🔹 Cloudflare SAFE mode (sin recaptcha)
🔹 Caché Firestore: Desactivada
🔹 Overlay: Activo (CFC_showBlockOverlay)
🔹 Control: UID + sessionId (comparación continua)
🔹 Intervalo token: 45 s
🔹 Auditor: CFC-SYNC 2025-11-10
-----------------------------------------
`);
