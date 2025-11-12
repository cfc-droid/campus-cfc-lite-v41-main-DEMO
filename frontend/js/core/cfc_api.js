// ✅ CFC_LOCK_SERVER_SYNC_MODE_V59.0_RENDER_UNIQUE_SESSION_FINAL
// 🌐 Comunicación segura Campus ↔ Render (Express + Firebase)
// 🔒 Maneja sesiones únicas y cierre remoto en caso de duplicado
// QA-SYNC — 2025-11-12 — Validado con backend V59.0

const SERVER_URL = "https://cfc-lock-proxy.onrender.com"; // ✅ Proxy activo en Render

/* ==========================================================
   🔹 Registrar login: marca el dispositivo activo en backend
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
    const endpoint = `${SERVER_URL}/check-session?email=${encodeURIComponent(
      email
    )}&device_id=${encodeURIComponent(device_id)}`;
    const res = await fetch(endpoint, { method: "GET", cache: "no-store" });

    if (!res.ok) {
      console.warn("⚠️ Respuesta inesperada del servidor:", res.status);
      return false;
    }

    const data = await res.json();

    if (data.status === "valid") {
      console.log("🟢 Sesión válida para:", email);
      return true;
    } else {
      console.warn("🔴 Sesión inválida:", data.reason || "sin motivo");
      return false;
    }
  } catch (err) {
    console.error("❌ Error al verificar sesión:", err);
    return false;
  }
}

/* ==========================================================
   💓 Envía un “heartbeat” (mantiene viva la sesión)
   ========================================================== */
export async function sendHeartbeat(email, device_id) {
  try {
    const payload = { email, device_id };
    const res = await fetch(`${SERVER_URL}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();
    if (data.status === "expired") {
      console.warn("🚨 Sesión expirada por otro dispositivo.");
      triggerLogout("⚠️ Otro dispositivo inició sesión con tu cuenta.");
      return;
    }

    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);
    console.log("💓 Heartbeat enviado correctamente");
  } catch (err) {
    console.warn("⚠️ Error al enviar heartbeat:", err.message);
  }
}

/* ==========================================================
   ⏱️ Inicia el bucle de heartbeats automáticos
   ========================================================== */
export function startHeartbeat(email, device_id, intervalMs = 15000) {
  sendHeartbeat(email, device_id); // primer pulso inmediato
  setInterval(() => sendHeartbeat(email, device_id), intervalMs);
  console.log(`💓 Heartbeat activo cada ${intervalMs / 1000}s para ${device_id}`);
}

/* ==========================================================
   🚪 Logout remoto visual (expulsión)
   ========================================================== */
function triggerLogout(msg) {
  try {
    localStorage.clear();
    import("../overlay_block.js").then(({ CFC_showBlockOverlay }) => {
      CFC_showBlockOverlay(msg);
      setTimeout(() => {
        window.location.href = "../html/login.html";
      }, 2000);
    });
  } catch (e) {
    console.error("⚠️ Error al ejecutar logout remoto:", e);
    window.location.href = "../html/login.html";
  }
}

console.log(`
🧩 QA-SYNC | CFC_LOCK_SERVER_SYNC_MODE_V59.0_RENDER_UNIQUE_SESSION_FINAL
────────────────────────────────────────────
🔹 Comunicación segura Campus ↔ Render
🔹 Sesión única: invalida anteriores automáticamente
🔹 Heartbeat con detección “expired”
🔹 Cierre remoto inmediato con overlay dorado
────────────────────────────────────────────
`);
