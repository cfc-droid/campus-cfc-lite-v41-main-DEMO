/* ==========================================================
   ✅ CFC_LOCK_IDENTITY_V68.0_FIRESTORE_RENDER_REALTIME
   Sistema: Campus CFC LITE V41-DEMO
   ========================================================== */

function CFC_showBlockOverlay(msg) {
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,0.85);
    color:#ffd700;font-family:Poppins,sans-serif;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;font-size:22px;
  `;
  overlay.innerHTML = `<div>⚠️ ${msg}</div>`;
  document.body.appendChild(overlay);
}

async function checkSession(email, did) {
  try {
    const res = await fetch(
      `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${did}`
    );
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return true;
  }
}

async function registerLogin(email, did) {
  try {
    const res = await fetch(
      `https://cfc-lock-proxy.onrender.com/register-login?email=${email}&device_id=${did}`
    );
    const data = await res.json();
    return data.status === "registered";
  } catch {
    return false;
  }
}

function triggerLogout(msg) {
  console.log("🚨 Logout forzado:", msg);

  const deviceId = localStorage.getItem("CFC_DEVICE_ID"); // conservar

  localStorage.clear();

  if (deviceId) {
    localStorage.setItem("CFC_DEVICE_ID", deviceId);
  }

  setTimeout(() => {
    window.location.href = "/html/login.html?expired=true";
  }, 800);
}

function startHeartbeat(email, did) {
  setInterval(() => {
    fetch(
      `https://cfc-lock-proxy.onrender.com/heartbeat?email=${email}&device_id=${did}`
    );
  }, 5000);
}

const {
  initializeApp,
  getApps,
  getApp
} = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");

const {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

/* ==========================================================
   🔹 Firebase SAFE Config
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDLWDiJaXYQbXeDAp8uE6-7abSdyBBabys",
  authDomain: "cfc-lock-firebase.firebaseapp.com",
  projectId: "cfc-lock-firebase",
};

let db;
try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🧩 Firebase inicializado (modo SAFE)");
} catch (err) {
  console.error("❌ Error Firebase:", err);
}

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();
const makeDeviceId = () => {
  let id = localStorage.getItem("CFC_DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("CFC_DEVICE_ID", id);
  }
  return id;
};

/* ==========================================================
   🔐 LOGIN (Firebase + Render Proxy)
   ========================================================== */
window.CFC_login = async function (email, license) {
  const e = email.trim().toLowerCase();
  const k = license.trim();
  const sid = makeSessionId();
  const did = makeDeviceId();
  const ref = doc(db, "sessions", e);

  // 1️⃣ Registrar en Firestore (sesión activa)
  await setDoc(
    ref,
    {
      email: e,
      license_key: k,
      session_id: sid,
      device_id: did,
      active_session: true,
      session_force_closed: false,
      last_active: serverTimestamp(),
      updated_at_iso: nowISO(),
    },
    { merge: true }
  );

  // 2️⃣ Guardar en localStorage
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sid);
  localStorage.setItem("CFC_DEVICE_ID", did);

  console.log(`✅ Login Firebase OK | device_id=${did}`);

  // 3️⃣ Registrar en servidor Render
  const registered = await registerLogin(e, did);
  if (!registered) {
    CFC_showBlockOverlay("⚠️ No se pudo registrar el login en el servidor Render.");
    return;
  }

  // 4️⃣ Verificar validez inmediata
  const valid = await checkSession(e, did);
  if (!valid) return;

  // 5️⃣ Activar latidos + monitoreo
  startHeartbeat(e, did);
  startServerPolling(e, did);
  startRealtimeSync(e, did); // NUEVO ✅ sincroniza Render + Firestore en tiempo real

  // 6️⃣ Redirigir
  setTimeout(() => (window.location.href = "../index.html"), 800);
}

/* ==========================================================
   🔍 POLLING SERVIDOR — Validación periódica (Render)
   ========================================================== */
function startServerPolling(email, did) {
  setInterval(async () => {
    try {
      const valid = await checkSession(email, did);
      if (!valid) {
        console.warn("🚨 Sesión invalidada por Render (checkSession)");
        triggerLogout("⚠️ Tu sesión fue cerrada automáticamente (otro dispositivo inició sesión).");
      }
    } catch (err) {
      console.warn("⚠️ Error en polling servidor:", err.message);
    }
  }, 10000);
}

/* ==========================================================
   🔔 LISTENER FIRESTORE — Detección remota en tiempo real
   ========================================================== */
function listenRemoteLogout(email, ref, did) {
  onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    const active = data.active_session ?? true;
    const force = data.session_force_closed ?? false;
    const storedDid = localStorage.getItem("CFC_DEVICE_ID");

    if ((!active || force) && storedDid === did) {
      console.warn("🚨 Firestore detectó cierre remoto → logout inmediato");
      triggerLogout("⚠️ Tu sesión fue cerrada desde otro dispositivo.");
    }
  });
}

/* ==========================================================
   ⚡ Render Sync — chequeo activo de Render cada 15 s
   ========================================================== */
function startRealtimeSync(email, did) {
  setInterval(async () => {
    try {
      const res = await fetch(
        `https://cfc-lock-proxy.onrender.com/check-session?email=${email}&device_id=${did}`
      );
      const data = await res.json();
      if (data.status === "expired") {
        console.warn("🚨 Render detectó cierre remoto → logout inmediato");
        triggerLogout("⚠️ Tu sesión fue cerrada automáticamente (otro dispositivo inició sesión).");
      }
    } catch (err) {
      console.warn("⚠️ Error al sincronizar con Render:", err);
    }
  }, 15000);
}

/* ==========================================================
   🧩 AUTOLOAD — Reanudar sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const did = localStorage.getItem("CFC_DEVICE_ID");
  if (e && did) {
    console.log("♻️ Restaurando sesión previa:", e);
    startHeartbeat(e, did);
    startServerPolling(e, did);
    startRealtimeSync(e, did);
    const ref = doc(db, "sessions", e);
    listenRemoteLogout(e, ref, did);
  }
});

console.log(`
🧩 QA-SYNC | CFC_LOCK_IDENTITY_V68.0_FIRESTORE_RENDER_REALTIME
────────────────────────────────────────────
🔹 Listener Firestore activo + cierre remoto inmediato
🔹 Polling + Render Sync combinados
🔹 Sincronización en tiempo real entre Firestore y Proxy
────────────────────────────────────────────
`);
