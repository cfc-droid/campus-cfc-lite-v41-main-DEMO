/* ==========================================================
   ✅ CFC_LOCK_CORE_V70.0_FINALFIX
   Sistema: Campus CFC LITE V41-DEMO
   Propósito: Cierre automático multi-dispositivo garantizado
   ========================================================== */

(async () => {
  const API_URL = "https://cfc-lock-proxy.onrender.com";

  function logoutNow(reason) {
    console.warn("🚨 Logout forzado:", reason);
    localStorage.clear();
    sessionStorage.clear();
    const msg = reason || "⚠️ Sesión cerrada automáticamente.";
    const overlay = document.createElement("div");
    overlay.innerHTML = `
      <div style="
        position:fixed;inset:0;z-index:99999;
        background:rgba(0,0,0,0.85);
        color:#ffd700;font-family:Poppins,sans-serif;
        display:flex;align-items:center;justify-content:center;
        flex-direction:column;font-size:22px;">
        <div>⚠️ ${msg}</div>
        <div style="font-size:16px;margin-top:10px;">Redirigiendo...</div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => (window.location.href = "/html/login.html?expired=true"), 2000);
  }

  async function verify() {
    const email = localStorage.getItem("CFC_EMAIL");
    const did = localStorage.getItem("CFC_DEVICE_ID");
    if (!email || !did) return;

    try {
      const res = await fetch(`${API_URL}/check-session?email=${email}&device_id=${did}`);
      const data = await res.json();
      if (data.status === "expired" || data.status === "invalid") {
        logoutNow("Tu sesión fue cerrada desde otro dispositivo.");
      }
    } catch (err) {
      console.log("🔁 Error temporal al verificar sesión:", err.message);
    }
  }

  console.log("🧠 CFC_LOCK_CORE activo → monitoreo cada 5 s");
  setInterval(verify, 5000);
})();

/* ============================================================
   CFC-SYNC — HEARTBEAT DOMINIO (B)
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   CFC-SYNC — ROOT GUARD + COMPATIBILIDAD (C)(F)
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";
