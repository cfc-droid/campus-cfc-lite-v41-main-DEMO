/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V48.4_AUTH_RESET_FINAL
   Sistema: CFC-LOCK — Auth reset completo + sesión única 100%
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
console.log("🔥 Firebase inicializado — V48.4");

/* ==========================================================
   🧩 Helpers
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function hardAuthReset() {
  try {
    await signOut(auth);
  } catch {}
  // 🔄 Elimina caché local de Firebase (IndexedDB)
  if (window.indexedDB) {
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase("firebaseLocalStorageDb");
      req.onsuccess = resolve;
      req.onerror = resolve;
      req.onblocked = resolve;
    });
  }
  console.log("🧹 Firebase Auth local completamente reseteado");
}

/* ==========================================================
   🔐 LOGIN — con hard reset previo
   ========================================================== */
export async function CFC_login(email, pass) {
  try {
    console.log("🧠 Iniciando hard reset antes del login...");
    await hardAuthReset();
    await sleep(500);

    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const uid = user.uid;
    const newSID = makeSessionId();

    console.log(`🔐 Login completado UID=${uid}`);

    // 🔄 Eliminar sesión previa y registrar nueva
    await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await setDoc(doc(db, "sessions", uid), {
      sessionId: newSID,
      updatedAt: serverTimestamp()
    });

    localStorage.setItem("CFC_SESSION_UID", uid);
    localStorage.setItem("CFC_SESSION_ID", newSID);
    localStorage.setItem("CFC_SESSION_ACTIVE", "true");
    localStorage.setItem("CFC_TIMER", "0");
    localStorage.setItem("CFC_time_total", "0");

    // 🔧 Suspender listener por 1.5s para evitar overlay
    window.CFC_SESSION_WATCHER_SUSPENDED = true;
    setTimeout(() => { window.CFC_SESSION_WATCHER_SUSPENDED = false; }, 1500);

    console.log(`✅ Nueva sesión registrada ${uid} | SID=${newSID}`);
    window.location.href = "../index.html";
  } catch (err) {
    console.error("❌ Error en login:", err);
    alert("Error al iniciar sesión: " + err.message);
  }
}

/* ==========================================================
   🔒 LOGOUT
   ========================================================== */
export async function CFC_logout() {
  try {
    const uid = localStorage.getItem("CFC_SESSION_UID");
    localStorage.setItem("CFC_LOGOUT_INTENT", "true");
    if (uid) await deleteDoc(doc(db, "sessions", uid)).catch(() => {});
    await signOut(auth);
    await hardAuthReset();

    console.log("✅ Logout completo");
    CFC_showBlockOverlay("Cierre de sesión exitoso");
  } catch (err) {
    console.error("❌ Error durante logout:", err);
  }
}

/* ==========================================================
   🧠 Listener global de sesión
   ========================================================== */
if (!window.CFC_SESSION_WATCHER_ACTIVE) {
  window.CFC_SESSION_WATCHER_ACTIVE = true;
  let unsubscribe = null;
  let tokenTimer = null;

  onAuthStateChanged(auth, async (user) => {
    if (window.CFC_SESSION_WATCHER_SUSPENDED) return;

    const href = window.location.href.toLowerCase();
    const isLogin = href.includes("login.html");
    const logoutIntent = localStorage.getItem("CFC_LOGOUT_INTENT") === "true";

    if (!user) {
      localStorage.setItem("CFC_SESSION_ACTIVE", "false");
      if (!isLogin && !logoutIntent) {
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
      await signOut(auth);
      await hardAuthReset();
      CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
      return;
    }

    if (unsubscribe) unsubscribe();
    unsubscribe = onSnapshot(ref, (docSnap) => {
      if (window.CFC_SESSION_WATCHER_SUSPENDED) return;
      if (!docSnap.exists()) {
        signOut(auth);
        CFC_showBlockOverlay("🚫 Sesión cerrada en otro dispositivo");
        return;
      }
      const remote = docSnap.data();
      if (remote.sessionId !== localSID) {
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

console.log(`
✅ CFC_LOCK QA-SYNC FINAL V48.4 — Auth reset fix aplicado
Fecha: ${new Date().toISOString()}
`);
