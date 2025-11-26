/* ==========================================================
   🔐 CFC_LOCK_CORE_V70.2_HYBRID_SILENT
   Subpaso: 4.7 — PRUEBA 14
   Función: Heartbeat + Render Sync (solo detección)
   ========================================================== */

const CFC_LOCK_ENFORCE = false; // 🔥 SILENT MODE — NO expulsar

(function () {

  const API = "https://cfc-lock-proxy.onrender.com";

  function getLocalSession() {
    const email = localStorage.getItem("CFC_EMAIL");
    const device_id = localStorage.getItem("CFC_DEVICE_ID");
    const session_id = localStorage.getItem("CFC_SESSION_ID");
    return email && device_id && session_id
      ? { email, device_id, session_id }
      : null;
  }

  async function runHybrid() {
    const s = getLocalSession();

    if (!s) {
      console.warn("⚠️ [HYBRID] No MSCU local (OK en SILENT)");
      return;
    }

    if (window.location.pathname.includes("login")) return;

    // Render Sync
    try {
      const res = await fetch(
        `${API}/check-session?email=${s.email}&device_id=${s.device_id}`
      );
      const json = await res.json();

      console.log("🌐 [HYBRID] Render Sync:", json);

      if (json.status === "invalid") {
        console.warn("⚠️ Render detectó sesión duplicada (SILENT)");
      }

    } catch (err) {
      console.log("🔁 Error Render Hybrid:", err.message);
    }
  }

  console.log("🧩 QA-SYNC | CFC_LOCK_CORE V70.2 HYBRID-SILENT activo");
  setInterval(runHybrid, 5000);
  runHybrid();

})();
