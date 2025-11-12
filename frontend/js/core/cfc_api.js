/* ==========================================================
   ✅ CFC_API_CLIENT_V57.5
   Función: Comunicación con micro backend Render SAFE
   ========================================================== */

const SERVER_URL = "https://cfc-lock-proxy.onrender.com";

export async function checkSessionStatus(email, deviceId) {
  const res = await fetch(`${SERVER_URL}/check-session?email=${email}&device_id=${deviceId}`);
  if (!res.ok) throw new Error("Server error");
  const data = await res.json();
  return data.status; // "valid" | "invalid"
}

export async function notifyHeartbeat(email, deviceId) {
  try {
    await fetch(`${SERVER_URL}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id: deviceId }),
    });
    console.log("💓 Heartbeat enviado al servidor:", deviceId);
  } catch (err) {
    console.warn("⚠️ No se pudo enviar heartbeat:", err.message);
  }
}
