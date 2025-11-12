// ✅ CFC_LOCK_SERVER_SYNC_MODE V57.5_FINAL
// 🌐 Comunicación segura con servidor Render (Express + Firebase)

const SERVER_URL = "https://cfc-lock-proxy.onrender.com"; // ← tu URL real de Render

// 🧠 Función: verificar si el dispositivo actual sigue autorizado
export async function checkSession(email, device_id) {
  try {
    const res = await fetch(`${SERVER_URL}/check-session?email=${email}&device_id=${device_id}`);
    const data = await res.json();
    return data.status === "valid";
  } catch (err) {
    console.error("❌ Error al verificar sesión:", err);
    return false;
  }
}

// 💓 Función: enviar heartbeat (actualiza el last_active)
export async function sendHeartbeat(email, device_id) {
  try {
    await fetch(`${SERVER_URL}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_id })
    });
  } catch (err) {
    console.warn("⚠️ Error al enviar heartbeat:", err);
  }
}

// ⏱️ Función: iniciar bucle automático de heartbeats
export function startHeartbeat(email, device_id) {
  sendHeartbeat(email, device_id);
  setInterval(() => sendHeartbeat(email, device_id), 10000);
  console.log("💓 Heartbeat iniciado cada 10s para", device_id);
}
