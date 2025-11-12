// ✅ CFC_LOCK_SERVER_SYNC_MODE_V58.3_RENDER_STABLE
// 🌐 Comunicación segura Campus ↔ Render (Express + Firebase)
// Última revisión QA-SYNC — 2025-11-12 — Validado con backend V57.8

const SERVER_URL = "https://cfc-lock-proxy.onrender.com"; // ✅ Proxy activo en Render

// 🧠 Verifica si la sesión del usuario sigue siendo válida
export async function checkSession(email, device_id) {
  try {
    const endpoint = `${SERVER_URL}/check-session?email=${encodeURIComponent(email)}&device_id=${encodeURIComponent(device_id)}`;
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
      console.log("🔴 Sesión inválida:", data.reason || "sin motivo");
      return false;
    }
  } catch (err) {
    console.error("❌ Error al verificar sesión:", err);
    return false;
  }
}

// 💓 Envía un “heartbeat” al servidor (mantiene la sesión viva)
export async function sendHeartbeat(email, device_id) {
  try {
    const payload = { email, device_id };
    const res = await fetch(`${SERVER_URL}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);
    console.log("💓 Heartbeat enviado correctamente");
  } catch (err) {
    console.warn("⚠️ Error al enviar heartbeat:", err.message);
  }
}

// ⏱️ Inicia el bucle de heartbeats automáticos
export function startHeartbeat(email, device_id, intervalMs = 15000) {
  // Envia uno inmediato al cargar
  sendHeartbeat(email, device_id);

  // Repite cada X segundos (por defecto 15 s)
  setInterval(() => sendHeartbeat(email, device_id), intervalMs);

  console.log(`💓 Heartbeat iniciado cada ${intervalMs / 1000}s para ${device_id}`);
}
