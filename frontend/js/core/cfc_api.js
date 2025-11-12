// ✅ CFC_LOCK_SERVER_SYNC_MODE_V60.3_RENDER_LOGOUT_CLOUDFLARE_SAFE
// 🌐 Comunicación Campus ↔ Render Proxy (Express + Firebase)
// 🔒 Cierre remoto unificado con overlay dorado (compatible Cloudflare Pages SAFE)

import { CFC_showBlockOverlay } from "../overlay_block.js"; // ← import directo (sin dynamic import)

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
   🔹 Verificar sesión actual
   ========================================================== */
export async function checkSession(email, device_id) {
  try {
    const res = await fetch(
      `${SERVER_URL}/check-session?email=${encodeURIComponent(email)}&device_id=${encodeURIComponent(device_id)}`,
      { method: "GET", cache: "no-store" }
    );
    const data = await res.json();

    if (data.status === "valid") {
      console.log("🟢 Sesión válida:", email);
      return true;
    }

    if (data.status === "expired" || data.status === "invalid") {
      console.warn("🚨 Sesión expirada/inválida detectada → logout remoto");
      triggerLogout("⚠️ Tu sesión fue cerrada por otro dispositivo.");
      return false;
    }

    console.warn("⚠️ Respuesta desconocida:", data);
    return false;
  } catch (err) {
    console.error("❌ Error checkSession:", err);
    return false;
  }
}

/* ==========================================================
   💓 Heartbeat — mantiene viva la sesión
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
      console.warn("🚨 Heartbeat detectó sesión expirada");
      triggerLogout("⚠️ Otro dispositivo inició sesión con tu cuenta.");
      return;
    }

    console.log("💓 Heartbeat OK:", data.status);
  } catch (err) {
    console.warn("⚠️ Error al enviar heartbeat:", err.message);
  }
}

/* ==========================================================
   ⏱️ Bucle de verificación
   ========================================================== */
export function startHeartbeat(email, device_id, intervalMs = 15000) {
  sendHeartbeat(email, device_id);
  setInterval(() => sendHeartbeat(email, device_id), intervalMs);
  console.log(`💓 Heartbeat activo cada ${intervalMs / 1000}s → ${device_id}`);
}

/* ==========================================================
   🚪 Logout remoto unificado (Cloudflare SAFE)
   ========================================================== */
export function triggerLogout(msg = "⚠️ Tu sesión fue cerrada automáticamente.") {
  try {
    localStorage.clear();
    CFC_showBlockOverlay(msg);
    console.log("🔒 Logout remoto ejecutado → redirección en 2.5s");
    setTimeout(() => (window.location.href = "../html/login.html"), 2500);
  } catch (err) {
    console.error("⚠️ Error durante logout remoto:", err);
    window.location.href = "../html/login.html";
  }
}

console.log(`
🧩 QA-SYNC | CFC_LOCK_SERVER_SYNC_MODE_V60.3_RENDER_LOGOUT_CLOUDFLARE_SAFE
────────────────────────────────────────────
🔹 Import directo de overlay_block.js
🔹 Logout inmediato ante "expired"
🔹 100% compatible Cloudflare Pages SAFE
────────────────────────────────────────────
`);
