/* ==========================================================
   ✅ CFC_API_V69.0_LOCK_SYNC
   ========================================================== */
const API_URL = "https://cfc-lock-proxy.onrender.com";

/* 🔹 Registrar login en Render */
export async function registerLogin(email, deviceId) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id: deviceId }),
    });
    const data = await res.json();
    return data.status === "ok";
  } catch (err) {
    console.error("❌ Error registerLogin:", err);
    return false;
  }
}

/* 🔹 Verificar sesión en Render */
export async function checkSession(email, deviceId) {
  try {
    const res = await fetch(
      `${API_URL}/check-session?email=${email}&device_id=${deviceId}`
    );
    const data = await res.json();
    if (data.status === "expired" || data.status === "invalid") return false;
    return data.status === "valid" || data.status === "ok";
  } catch (err) {
    console.warn("⚠️ Error checkSession:", err);
    return true; // evita falsos positivos si hay timeout
  }
}

/* 🔹 Heartbeat (mantener activa) */
export async function startHeartbeat(email, deviceId) {
  setInterval(async () => {
    try {
      await fetch(`${API_URL}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, device_id: deviceId }),
      });
    } catch (err) {
      console.warn("⚠️ Heartbeat falló:", err.message);
    }
  }, 20000);
}

/* 🔹 Forzar logout */
export function triggerLogout(msg) {
  localStorage.clear();
  sessionStorage.clear();
  console.warn(msg);
  if (typeof CFC_showBlockOverlay === "function") {
    CFC_showBlockOverlay(msg || "⚠️ Sesión cerrada automáticamente.");
  }
  setTimeout(() => (window.location.href = "/html/login.html?expired=true"), 1500);
}


/* ============================================================
   (B) HEARTBEAT DE DOMINIO
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);


/* ============================================================
   (C) COMPATIBILIDAD cfc_lock_identity.js
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";


/* ============================================================
   (F) ROOT GUARD — verificación identidad
============================================================ */
if (!localStorage.getItem("CFC_DEVICE_ID")) {
  window.location.href = "/html/login.html";
}


/* ============================================================
   (G) HEARTCORE MONITOR — verificación sessionId + overlay
============================================================ */
setInterval(() => {
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (!sid) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;z-index:999999;";
    ov.innerHTML = "<div>⚠️ Sesión inválida</div>";
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = '/html/login.html'), 1500);
  }
}, 5000);
