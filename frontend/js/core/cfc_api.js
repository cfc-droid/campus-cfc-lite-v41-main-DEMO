// ✅ CFC_LOCK_SERVER_SYNC_MODE_V60.2_FRONTEND_AUTO_LOGOUT_FIX
// 🌐 Comunicación Campus ↔ Render Proxy (Express + Firebase)
// 🔒 Maneja sesiones únicas y cierre remoto automático (overlay dorado)

const SERVER_URL = "https://cfc-lock-proxy.onrender.com";

/* ==========================================================
   🔹 Registrar login en Render
   ========================================================== */
export async function registerLogin(email, device_id) {
  try {
    const res = await fetch(`${SERVER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("🟢 Sesión registrada en Render:", device_id);
    return true;
  } catch (err) {
    console.error("❌ Error al registrar login:", err);
    return false;
  }
}

/* ==========================================================
   🔹 Verifica si la sesión actual sigue siendo válida
   ========================================================== */
export async function checkSession(email, device_id) {
  try {
    const res = await fetch(
      `${SERVER_URL}/check-session?email=${encodeURIComponent(email)}&device_id=${encodeURIComponent(device_id)}`,
      { method: "GET", cache: "no-store" }
    );

    const data = await res.json();
    if (data.status === "valid") {
      console.log("🟢 Sesión válida para:", email);
      return true;
    } else if (data.status === "expired" || data.status === "invalid") {
      console.warn("🚨 Sesión inválida/expirada:", data.reason);
      triggerLogout("⚠️ Tu sesión fue cerrada por otro dispositivo.");
      return false;
    } else {
      console.warn("⚠️ Respuesta desconocida:", data);
      return false;
    }
  } catch (err) {
    console.error("❌ Error al verificar sesión:", err);
    return false;
  }
}

/* ==========================================================
   💓 Heartbeat (mantiene viva la sesión)
   ========================================================== */
export async function sendHeartbeat(email, device_id) {
  try {
    const res = await fetch(`${SERVER_URL}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id }),
      cache: "no-store",
    });

    const data = await res.json();
    if (data.status === "expired") {
      console.warn("🚨 Sesión expirada por otro dispositivo.");
      triggerLogout("⚠️ Tu sesión fue cerrada automáticamente (otro dispositivo inició sesión).");
      return;
    }

    console.log("💓 Heartbeat OK:", data.status);
  } catch (err) {
    console.warn("⚠️ Error al enviar heartbeat:", err.message);
  }
}

/* ==========================================================
   ⏱️ Bucle automático
   ========================================================== */
export function startHeartbeat(email, device_id, intervalMs = 15000) {
  sendHeartbeat(email, device_id);
  setInterval(() => sendHeartbeat(email, device_id), intervalMs);
  console.log(`💓 Heartbeat activo cada ${intervalMs / 1000}s para ${device_id}`);
}

/* ==========================================================
   🚪 Logout remoto unificado (exportable)
   ========================================================== */
export function triggerLogout(msg = "⚠️ Tu sesión fue cerrada por otro dispositivo.") {
  try {
    localStorage.clear();
    import("../overlay_block.js").then(({ CFC_showBlockOverlay }) => {
      CFC_showBlockOverlay(msg);
      setTimeout(() => {
        window.location.href = "../html/login.html";
      }, 2500);
    });
  } catch (err) {
    console.error("⚠️ Error durante logout remoto:", err);
    window.location.href = "../html/login.html";
  }
}

console.log(`
🧩 QA-SYNC | CFC_LOCK_SERVER_SYNC_MODE_V60.2_FRONTEND_AUTO_LOGOUT_FIX
────────────────────────────────────────────
🔹 Exporta triggerLogout()
🔹 Sincroniza polling + heartbeat
🔹 Overlay dorado + redirección inmediata
────────────────────────────────────────────
`);
