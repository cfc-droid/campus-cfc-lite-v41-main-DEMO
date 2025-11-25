/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V72_COMPATIBLE
   Sistema: Campus CFC LITE V41-DEMO
   Adaptado SIN borrar nada — 100% compatible con login local
   ========================================================== */

/* ==========================================================
   🔹 IMPORTS ADAPTADOS (sin ES6 modules)
   ========================================================== */

// overlay_block.js expone una función global: window.CFC_showBlockOverlay
// cfc_api.js expone funciones globales si existen (no obligatorio ahora)


/* ==========================================================
   🔹 Firebase SDK (modo global, sin imports ES6)
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let firebaseApp = null;
let db = null;

(function initFirebaseSafe() {
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("🧩 Firebase inicializado (modo GLOBAL SAFE)");
  } catch (err) {
    console.error("❌ Error Firebase inicializando:", err);
  }
})();

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

function makeDeviceId() {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = self.crypto?.randomUUID?.() || ("dev_" + Math.random().toString(36).slice(2, 12));
    localStorage.setItem("CFC_DEVICE_ID", id);
  }
  return id;
}

/* ==========================================================
   🔐 LOGIN ADAPTADO (compatible con login local)
   ========================================================== */
/**
 * Este login NO reemplaza tu login local.
 * Solo se usa cuando el login.html actual lo llame en el futuro.
 *
 * Cristian: tu login actual NO llama a CFC_login(), está bien.
 * Este archivo queda listo para cuando quieras activar Firebase real.
 */

window.CFC_login = async function (email, license) {
  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();
  const ref = db.collection("licenses").doc(email);

  try {
    await ref.set(
      {
        email: e,
        license_key: k,
        session_id: sid,
        device_id: did,
        active_session: true,
        session_force_closed: false,
        updated_at_iso: nowISO(),
        last_active: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Guardar en localStorage
    localStorage.setItem("CFC_EMAIL", e);
    localStorage.setItem("CFC_LICENSE", k);
    localStorage.setItem("CFC_SESSION_ID", sid);
    localStorage.setItem("CFC_DEVICE_ID", did);

    console.log(`✅ Login Firebase OK | device_id=${did}`);

    // LATIDOS LOCALES (opcional, no rompe nada)
    startLocalHeartbeat(e, did);

    // Listener Firestore para detectar cierre remoto
    listenRemoteLogout(e, ref, did);

    // Redirigir luego de 800ms
    setTimeout(() => (window.location.href = "../index.html"), 800);
  } catch (err) {
    console.error("❌ Error en CFC_login:", err);
    if (window.CFC_showBlockOverlay)
      window.CFC_showBlockOverlay("⚠️ Error al sincronizar login con servidor.");
  }
};

/* ==========================================================
   🔍 FIRESTORE LISTENER — Cierre remoto en tiempo real
   ========================================================== */
function listenRemoteLogout(email, ref, did) {
  ref.onSnapshot((docSnap) => {
    if (!docSnap.exists) return;
    const data = docSnap.data() || {};

    const active = data.active_session !== false;
    const force = data.session_force_closed === true;
    const storedDid = localStorage.getItem("CFC_DEVICE_ID");

    if ((!active || force) && storedDid === did) {
      console.warn("🚨 Firestore: cierre remoto detectado → logout inmediato");

      if (window.CFC_showBlockOverlay) {
        window.CFC_showBlockOverlay("⚠️ Tu sesión fue cerrada desde otro dispositivo.");
      }

      // Limpieza leve (sin clear completo)
      localStorage.removeItem("CFC_SESSION_ACTIVE");
      localStorage.removeItem("CFC_SESSION_ID");

      // Redirigir
      setTimeout(() => {
        window.location.href = "../html/login.html?expired=true";
      }, 1500);
    }
  });
}

/* ==========================================================
   ⚡ Render Sync ADAPTADO — Opcional y seguro
   ========================================================== */
function startRenderSync(email, did) {
  setInterval(async () => {
    try {
      const url = `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${did}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data?.status === "expired") {
        console.warn("🚨 Render detectó cierre remoto → logout inmediato");

        if (window.CFC_showBlockOverlay) {
          window.CFC_showBlockOverlay("⚠️ Tu sesión fue cerrada en otro dispositivo.");
        }

        setTimeout(() => {
          window.location.href = "../html/login.html?expired=true";
        }, 1500);
      }
    } catch (err) {
      console.warn("⚠️ Error Render Sync:", err.message);
    }
  }, 12000);
}

/* ==========================================================
   🫀 Latido local — No interfiere con CFC_LOCK_CORE
   ========================================================== */
function startLocalHeartbeat(email, did) {
  setInterval(() => {
    localStorage.setItem("CFC_HEARTBEAT_TS", Date.now());
  }, 4000);
}

/* ==========================================================
   ♻️ AUTOLOAD — Reanudar sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const did = localStorage.getItem("CFC_DEVICE_ID");

  if (email && did) {
    console.log("♻️ Restaurando sesión previa:", email);

    const ref = db.collection("licenses").doc(email);

    // Restaurar listeners
    listenRemoteLogout(email, ref, did);
    startLocalHeartbeat(email, did);
    startRenderSync(email, did);
  }
});

/* ==========================================================
   🔵 QA-SYNC LOG
   ========================================================== */
console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V72_COMPATIBLE
────────────────────────────────────────────
🔹 Compatible con login local CFC_USERS
🔹 Firebase Firestore: colección /sessions
🔹 Listener cierre remoto → overlay + redirect
🔹 Render Sync seguro (12s)
🔹 Latido local activo
🔹 Sin borrar nada de V68
────────────────────────────────────────────
`);
