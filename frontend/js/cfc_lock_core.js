/* ==========================================================
   🔐 CFC_LOCK_CORE_V71.0_HEARTCORE_SILENT
   Subpaso: 4.7 — PRUEBA 15
   Función: Heartbeat REAL + Render Sync REAL (sin expulsar)
   ========================================================== */

const CFC_LOCK_ENFORCE = false; // 🔥 SILENT — NO expulsar aún

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";

  /* ----------------------------------------------
     Obtener MSCU local
  ---------------------------------------------- */
  function getLocalSession() {
    const email = localStorage.getItem("CFC_EMAIL");
    const device_id = localStorage.getItem("CFC_DEVICE_ID");
    const session_id = localStorage.getItem("CFC_SESSION_ID");

    return email && device_id && session_id
      ? { email, device_id, session_id }
      : null;
  }

  /* ----------------------------------------------
     Heartbeat → Mantener sesión viva (SILENT)
  ---------------------------------------------- */
  async function sendHeartbeat(s) {
    try {
      const res = await fetch(`${API}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: s.email,
          device_id: s.device_id
        })
      });

      const json = await res.json();
      console.log("❤️ [HEARTBEAT]", json);
    } catch (err) {
      console.warn("⚠️ Error Heartbeat:", err.message);
    }
  }

  /* ----------------------------------------------
     Update-session → Sync híbrido
  ---------------------------------------------- */
  async function sendUpdate(s) {
    try {
      const res = await fetch(`${API}/update-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: s.email,
          device_id: s.device_id,
          session_id: s.session_id
        })
      });

      const json = await res.json();
      console.log("🟡 [UPDATE-SESSION]", json);
    } catch (err) {
      console.warn("⚠️ Error update-session:", err.message);
    }
  }

  /* ----------------------------------------------
     Check-session → Estado remoto
  ---------------------------------------------- */
  async function checkRemote(s) {
    try {
      const res = await fetch(
        `${API}/check-session?email=${s.email}&device_id=${s.device_id}`
      );
      const json = await res.json();

      console.log("🌐 [CHECK-SESSION]", json);

      if (json.status === "invalid" || json.status === "expired") {
        console.warn("⚠️ SILENT: Sesión duplicada o expirada detectada.");
      }

    } catch (err) {
      console.warn("⚠️ Error check-session:", err.message);
    }
  }

  /* ----------------------------------------------
     Loop principal
  ---------------------------------------------- */
  async function heartcoreLoop() {
    const s = getLocalSession();

    if (!s) {
      console.warn("⚠️ Heartcore: no hay MSCU (OK)");
      return;
    }

    if (window.location.pathname.includes("login")) return;

    await sendHeartbeat(s);
    await sendUpdate(s);
    await checkRemote(s);
  }

  console.log("🧩 QA-SYNC | CFC_LOCK_CORE V71.0 HEARTCORE-SILENT activo");

  setInterval(heartcoreLoop, 5000);
  heartcoreLoop();

})();
